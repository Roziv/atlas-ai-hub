import prisma from '../src/db';

async function main() {
  console.log('🌱 Seeding database...');

  const aiSettingsJson = JSON.stringify({
    ai: {
      providers: {
        openai: { apiKey: 'sk-proj-DEMO_KEY_12345' },
        anthropic: { apiKey: 'sk-ant-DEMO_KEY_54321' },
        ollama: { baseUrl: 'http://localhost:11434' },
        ollama_cloud: { baseUrl: 'https://cloud.ollama.ai' }
      },
      modelLibrary: [
        { id: 'm1', name: 'GPT-4o', provider: 'openai', modelId: 'gpt-4o' },
        { id: 'm2', name: 'Claude 3.5 Sonnet', provider: 'anthropic', modelId: 'claude-3-5-sonnet-20240620' },
        { id: 'm3', name: 'Llama 3 (Local)', provider: 'ollama', modelId: 'llama3' }
      ],
      routingRules: [
        { department: 'Engineering', modelId: 'm3' },
        { department: 'Marketing', modelId: 'm1' },
        { department: 'Sales', modelId: 'm2' }
      ],
      governance: {
        pii_redaction: true,
        audit_all: true,
        spend_limit: false
      }
    }
  });

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {
      settings: aiSettingsJson
    },
    create: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      description: 'Enterprise AI Strategy Group',
      settings: aiSettingsJson
    },
  });

  // 2. Create Users
  const users = [
    {
      email: 'ziv@acme.corp',
      name: 'Ziv Rozenberg',
      role: 'ai_manager',
    },
    {
      email: 'ali@acme.corp',
      name: 'Ali Chen',
      role: 'end_user',
    },
    {
      email: 'cfo@acme.corp',
      name: 'Sarah Finney',
      role: 'cfo',
    },
  ];

  const createdUsers = await Promise.all(
    users.map((user: any) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          ...user,
          organizationId: org.id,
        },
      })
    )
  );

  const aiManager = createdUsers.find((u: any) => u.role === 'ai_manager')!;

  // 3. Create Models
  const modelData = [
    {
      name: 'customer-support-v2',
      type: 'fine-tuned',
      status: 'active',
      description: 'Llama-3 fine-tuned on support tickets',
    },
    {
      name: 'marketing-copy-gen',
      type: 'external',
      status: 'active',
      description: 'OpenAI GPT-4o integration for marketing',
    },
    {
      name: 'internal-code-assistant',
      type: 'proprietary',
      status: 'active',
      description: 'Custom trained on internal codebase',
    },
    {
      name: 'embedding-v3',
      type: 'external',
      status: 'active',
      description: 'Cohere embedding model',
    },
  ];

  const createdModels = await Promise.all(
    modelData.map((model: any) =>
      prisma.model.upsert({
        where: { organizationId_name: { organizationId: org.id, name: model.name } },
        update: {},
        create: {
          ...model,
          organizationId: org.id,
          ownerId: aiManager.id,
        },
      })
    )
  );

  // 4. Create Policies
  const policies = [
    {
      name: 'Restrict External API Calls',
      scope: 'all_production',
      description: 'Prevent PII from being sent to external providers',
    },
    {
      name: 'GPU Budget Control',
      scope: 'team_specific',
      description: 'Cap monthly GPU spend per team',
    },
  ];

  const createdPolicies = await Promise.all(
    policies.map((policy: any) =>
      prisma.policy.upsert({
        where: { organizationId_name: { organizationId: org.id, name: policy.name } },
        update: {},
        create: {
          ...policy,
          organizationId: org.id,
          createdById: aiManager.id,
        },
      })
    )
  );

  // 5. Create Violations
  const embeddingModel = createdModels.find((m: any) => m.name === 'embedding-v3')!;
  const externalApiPolicy = createdPolicies.find((p: any) => p.name === 'Restrict External API Calls')!;

  await prisma.violation.create({
    data: {
      organizationId: org.id,
      modelId: embeddingModel.id,
      policyId: externalApiPolicy.id,
      severity: 'critical',
      status: 'open',
      description: 'Sends data to Cohere API without anonymization',
      createdById: aiManager.id,
    },
  });

  // 6. Create Budgets (CFO Phase)
  const budgets = [
    { name: 'OpenAI API Monthly', monthlyLimit: 50000, alertThreshold: 0.8 },
    { name: 'AWS SageMaker', monthlyLimit: 120000, alertThreshold: 0.9 },
    { name: 'HuggingFace Inference', monthlyLimit: 5000, alertThreshold: 0.75 },
  ];

  await Promise.all(
    budgets.map((b) =>
      prisma.budget.create({
        data: {
          ...b,
          organizationId: org.id,
        },
      })
    )
  );

  // 7. Create Spend Records (last 30 days)
  const providers = ['aws', 'gcp', 'azure', 'openai', 'anthropic'];
  const spendRecords = [];
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    
    // Create 1-3 records per day per provider roughly
    for (const p of providers) {
      if (Math.random() > 0.3) { // 70% chance to have spend for this provider on this day
        spendRecords.push({
          organizationId: org.id,
          provider: p,
          amount: Math.floor(Math.random() * 500) + 100, // $100-$600
          model: 'gpt-4o',
          recordDate: d,
          metadata: JSON.stringify({ service: 'inference' }),
        });
      }
    }
  }

  await prisma.spendRecord.createMany({
    data: spendRecords,
  });

  // 8. Create Workflows
  const workflows = [
    {
      name: 'Model Approval Pipeline',
      description: 'Require security review for high-risk deployments',
      status: 'active',
      trigger: 'model_deployment',
      definition: JSON.stringify([
        { type: 'scan', target: 'compliance' },
        { type: 'notify', channel: 'slack', role: 'security_lead' },
        { type: 'approval', role: 'chief_ai_officer' },
      ]),
    },
    {
      name: 'Drift Auto-remediation',
      description: 'Auto-disable endpoints on accuracy drift',
      status: 'active',
      trigger: 'violation_detected',
      definition: JSON.stringify([
        { type: 'verify', target: 'drift_magnitude' },
        { type: 'disable_endpoint' },
        { type: 'notify', channel: 'pagerduty' },
      ]),
    },
    {
      name: 'Cost Optimization Hook',
      description: 'Notify on unbudgeted spend',
      status: 'paused',
      trigger: 'schedule',
      definition: JSON.stringify([
        { type: 'check_budget' },
        { type: 'notify', channel: 'email', recipient: 'cfo@acme.corp' },
      ]),
    },
  ];

  await Promise.all(
    workflows.map((wf: any) =>
      prisma.workflow.create({
        data: {
          ...wf,
          organizationId: org.id,
        },
      })
    )
  );

  console.log('✅ Seeding complete.');
}

export default main;

// Run seed if executed directly
if (require.main === module) {
  main()
    .catch((e: any) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
