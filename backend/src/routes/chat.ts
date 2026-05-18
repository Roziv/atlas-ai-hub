import { Router } from 'express';
import { recordAuditLog } from '../utils/audit';
import { triggerWorkflows } from '../utils/workflows';
import prisma from '../db';
import { createClerkClient } from '@clerk/backend';

const router = Router();
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Test endpoint for chat route
router.get('/test', (req, res) => {
  console.log('[CHAT] GET /test called');
  res.json({
    success: true,
    message: 'Chat route is working',
    timestamp: new Date().toISOString()
  });
});

// --- Budget Enforcement ---
async function checkBudget(orgId: string, department: string) {
    if (!department) return { allowed: true };

    const budget = await prisma.budget.findFirst({
        where: { organizationId: orgId, department: department }
    });

    if (!budget) return { allowed: true }; // No budget set, allow for now

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const spendAgg = await prisma.spendRecord.aggregate({
        where: { organizationId: orgId, department: department, recordDate: { gte: startOfMonth } },
        _sum: { amount: true }
    });

    const currentSpend = spendAgg._sum.amount || 0;
    if (currentSpend >= budget.monthlyLimit) {
        console.warn(`🛑 BUDGET EXCEEDED: ${department} (Limit: ${budget.monthlyLimit}, Spent: ${currentSpend})`);
        return { allowed: false, limit: budget.monthlyLimit, spent: currentSpend };
    }

    return { allowed: true };
}

// --- Cost Estimation Constants ($ per 1M tokens) ---
const RATES: Record<string, number> = {
  'gpt-4o': 15.00,
  'gpt-4o-mini': 0.15,
  'claude-3-5-sonnet': 15.00,
  'gemini-1.5-flash': 0.30,
  'gemini-2.0-flash': 0.30,
  'gemini-pro': 7.00,
  'llama3': 0.00,
  'default': 1.00
};

// --- Governance Scanner ---
async function scanContent(text: string, data: { orgId: string, modelId: string, userId: string }) {
    // 1. Fetch All Active Policies
    const policies = await prisma.policy.findMany({ 
        where: { organizationId: data.orgId } 
    });

    for (const policy of policies) {
        const rules = JSON.parse(policy.rules || '[]');
        
        for (const rule of rules) {
            let triggered = false;

            if (rule.type === 'pii') {
                const PII_PATTERNS: any = {
                    'credit_card': /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/,
                    'ssn': /\b\d{3}-\d{2}-\d{4}\b/
                };
                if (PII_PATTERNS[rule.subtype]?.test(text)) triggered = true;
            } 
            
            else if (rule.type === 'keyword') {
                const matches = rule.match || [];
                if (matches.some((word: string) => text.toLowerCase().includes(word.toLowerCase()))) {
                    triggered = true;
                }
            }

            if (triggered) {
                console.warn(`🚨 POLICY TRIGGERED: ${policy.name} (${rule.type})`);
                await prisma.violation.create({
                    data: {
                        organizationId: data.orgId,
                        modelId: data.modelId,
                        policyId: policy.id,
                        severity: 'critical',
                        status: 'open',
                        description: `Policy '${policy.name}' triggered: ${rule.type} detected.`,
                        createdById: data.userId || 'system',
                    }
                }).catch(e => console.error("Violation logging failed", e));

                // Trigger Workflows
                await triggerWorkflows('violation_detected', {
                    orgId: data.orgId,
                    modelId: data.modelId,
                    userId: data.userId,
                    policyName: policy.name,
                    violationType: rule.type
                });
            }
        }
    }
}

// --- Tool Execution Engine ---
async function executeTool(toolId: string, params: any) {
    const tool = await prisma.tool.findUnique({ where: { id: toolId } });
    if (!tool) throw new Error("Tool not found in library");

    const config = JSON.parse(tool.config || '{}');
    if (tool.type === 'api') {
        const { url, method, auth } = config;
        const headers: any = { 'Content-Type': 'application/json' };
        if (auth?.type === 'bearer') headers['Authorization'] = `Bearer ${auth.key}`;
        if (auth?.type === 'apikey') headers['X-API-Key'] = auth.key;

        const res = await fetch(url, {
            method: method || 'GET',
            headers,
            body: (method !== 'GET' && method !== 'HEAD') ? JSON.stringify(params) : undefined
        });
        
        if (!res.ok) return { error: `API Error: ${await res.text()}` };
        return await res.json();
    }
    return { message: "Action simulation complete", params };
}

async function recordUsage(data: { orgId: string, userId?: string, dept: string, provider: string, model: string, inputTokens: number, outputTokens: number }) {
    const rate = RATES[data.model] || RATES['default'];
    const amount = ((data.inputTokens + data.outputTokens) / 1_000_000) * rate;
    await prisma.spendRecord.create({
        data: { organizationId: data.orgId, userId: data.userId, department: data.dept, provider: data.provider, model: data.model, amount, tokensInput: data.inputTokens, tokensOutput: data.outputTokens }
    }).catch(e => console.error("Usage logging failed", e));
}

router.post('/', async (req, res) => {
  const { messages, agentConfig, userId } = req.body;

  try {
    console.log('[CHAT] POST / called');
    console.log('[CHAT] Request body keys:', Object.keys(req.body));
    console.log('[CHAT] Messages:', messages?.length || 'none');
    console.log('[CHAT] AgentConfig:', agentConfig?.name || 'none');

    // 1. Context
    let department = 'Default';
    if (userId) {
      try {
        const user = await clerkClient.users.getUser(userId);
        department = (user.publicMetadata.department as string) || 'Default';
      } catch (e) {}
    }

    console.log('[CHAT] Fetching organization...');
    let org = await prisma.organization.findUnique({ where: { id: (req as any).orgId } });
    if (!org) {
      console.log('[CHAT] Org not found by ID, using findFirst fallback');
      org = await prisma.organization.findFirst({
        orderBy: { createdAt: 'desc' }
      });
    }
    if (!org) throw new Error("Organization not found");
    console.log('[CHAT] Organization found:', org.id);

    // 2. Routing
    const settings = JSON.parse(org.settings || '{}');
    const aiConfig = settings.ai || { providers: {}, modelLibrary: [], routingRules: [] };
    const rules = aiConfig.routingRules || [];
    const library = aiConfig.modelLibrary || [];
    
    const rule = rules.find((r: any) => r.department === department) || rules[0];
    const modelDef = library.find((m: any) => m.id === rule?.modelId) || library[0] || { provider: 'ollama', modelId: 'llama3' };

    const provider = modelDef.provider;
    const modelId = (modelDef.modelId || '').trim();
    const providerConfig = aiConfig.providers[provider] || {};
    const systemPrompt = `You are "${agentConfig?.name || 'Assistant'}". ${agentConfig?.instructions || ''} [Dept: ${department}]`;

    // 3. Tools
    const selectedToolIds = agentConfig?.skills || [];
    const dbTools = await prisma.tool.findMany({ where: { id: { in: selectedToolIds } } });
    const toolDefs = dbTools.map(t => ({
        type: 'function',
        function: {
            name: t.id.replace(/[^a-zA-Z0-9_-]/g, '_'),
            description: t.description || `Execute ${t.name}`,
            parameters: { type: 'object', properties: { input: { type: 'string' } } }
        }
    }));

    let outputContent = "";
    console.log(`[CHAT REQUEST] Dept: ${department}, Provider: ${provider}, Model: ${modelId}`);
    
    // 2. Budget Check
    const budgetCheck = await checkBudget(org.id, department);
    if (!budgetCheck.allowed) {
        return res.status(403).json({ 
            success: false, 
            error: `Budget exceeded for ${department}. Monthly limit: $${budgetCheck.limit}. Current spend: $${budgetCheck.spent?.toFixed(2) || '0.00'}.` 
        });
    }

    // Governance Scan
    const fullPrompt = messages.map((m: any) => m.content).join("\n");
    await scanContent(fullPrompt, { orgId: org.id, modelId: modelDef.id, userId });

    // 3. Execution
    if (provider === 'openai' || provider === 'groq') {
        const baseUrl = provider === 'groq' ? 'https://api.groq.com/openai/v1' : 'https://api.openai.com/v1';
        const apiKey = providerConfig.apiKey;
        if (!apiKey) throw new Error(`${provider} API Key is missing`);
        
        // Ensure messages are valid for Groq
        const apiMessages = [
            { role: 'system', content: systemPrompt || "You are a helpful assistant." },
            ...messages.map((m: any) => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: String(m.content || "")
            }))
        ].filter(m => m.content.length > 0);

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ 
                model: modelId, 
                messages: [{ role: 'system', content: systemPrompt }, ...messages.map((m: any) => ({ role: m.role, content: String(m.content) }))],
                temperature: 0.7
            })
        });
        const json: any = await response.json();
        if (!response.ok) throw new Error(`${provider} Error (${response.status}): ${json.error?.message || JSON.stringify(json)}`);
        outputContent = json.choices?.[0]?.message?.content || "";
    } else if (provider === 'gemini') {
        const apiKey = providerConfig.apiKey;
        if (!apiKey) throw new Error("Gemini API Key is missing");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
            body: JSON.stringify({ contents: messages.map((m: any) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: (m.content || '') }] })) })
        });
        const json: any = await response.json();
        outputContent = json.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";
    } else if (provider === 'anthropic') {
        const apiKey = providerConfig.apiKey;
        if (!apiKey) throw new Error("Anthropic API Key is missing");
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({ model: modelId, max_tokens: 1024, system: systemPrompt, messages: messages.map((m: any) => ({ role: m.role, content: m.content })) })
        });
        const json: any = await response.json();
        outputContent = json.content[0].text;
    } else if (provider === 'ollama' || provider === 'ollama_cloud') {
        const baseUrl = (providerConfig.baseUrl || 'http://localhost:11434').trim();
        const response = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: modelId, messages: [{ role: 'system', content: systemPrompt }, ...messages], stream: false })
        });
        const json: any = await response.json();
        outputContent = json.message.content;
    }

    recordUsage({ orgId: org.id, userId, dept: department, provider, model: modelId, inputTokens: 100, outputTokens: 200 }).catch(() => {});
    
    // Ensure we never return empty content
    const responseContent = (outputContent && outputContent.trim() !== "") 
        ? outputContent 
        : `[System] The provider ${provider} connected successfully but did not return any text. Please verify the Model ID (${modelId}) is correct.`;

    return res.json({ success: true, data: { role: 'assistant', content: responseContent, meta: { provider, model: modelId, department } } });

  } catch (err: any) {
    console.error("[CHAT ERROR]", err);
    res.status(500).json({ success: false, error: err.message, data: { role: 'assistant', content: `🛑 ${err.message}` } });
  }
});

export default router;
