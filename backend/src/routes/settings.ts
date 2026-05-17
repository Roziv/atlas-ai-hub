import { Router } from 'express';
import prisma from '../db';

const router = Router();

// Helper function to get organization - use first org as fallback
async function getOrganization() {
  try {
    // Simply get the first organization from database
    const org = await prisma.organization.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    return org;
  } catch (err) {
    console.error('[SETTINGS] Error getting organization:', err);
    return null;
  }
}

// GET global AI settings
router.get('/ai', async (req, res) => {
  try {
    console.log('[SETTINGS] GET /ai called');

    const org = await getOrganization();
    if (!org) {
      console.error('[SETTINGS] No organization found');
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    console.log(`[SETTINGS] Using organization: ${org.id}`);

    let settings = {};
    try {
      settings = JSON.parse(org.settings || '{}');
    } catch (parseErr) {
      console.warn('[SETTINGS] Failed to parse settings JSON:', parseErr);
      settings = {};
    }

    const defaultAi = {
      providers: {
        openai: { apiKey: '' },
        anthropic: { apiKey: '' },
        ollama: { baseUrl: 'http://localhost:11434' },
        ollama_cloud: { baseUrl: 'https://cloud.ollama.ai' }
      },
      modelLibrary: [
        { id: 'm1', name: 'GPT-4o', provider: 'openai', modelId: 'gpt-4o' },
        { id: 'm2', name: 'Claude 3.5 Sonnet', provider: 'anthropic', modelId: 'claude-3-5-sonnet-20240620' }
      ],
      routingRules: [
        { department: 'Engineering', modelId: 'm1' }
      ],
      governance: {
        pii_redaction: true,
        audit_all: true,
        spend_limit: false
      }
    };

    console.log('[SETTINGS] Returning AI settings');
    res.json({ success: true, data: (settings as any).ai || defaultAi });
  } catch (err: any) {
    console.error('[SETTINGS ERROR] GET /ai:', err.message, err.stack);
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE global AI settings
router.post('/ai', async (req, res) => {
  try {
    const { aiSettings } = req.body;
    console.log('[SETTINGS] POST /ai called');

    const org = await getOrganization();
    if (!org) {
      console.error('[SETTINGS] No organization found');
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    console.log(`[SETTINGS] Using organization: ${org.id}`);

    let currentSettings = {};
    try {
      currentSettings = JSON.parse(org.settings || '{}');
    } catch (parseErr) {
      console.warn('[SETTINGS] Failed to parse existing settings JSON:', parseErr);
      currentSettings = {};
    }

    const updatedSettings = { ...currentSettings, ai: aiSettings };

    await prisma.organization.update({
      where: { id: org.id },
      data: { settings: JSON.stringify(updatedSettings) }
    });

    console.log(`[SETTINGS] Successfully updated settings for org: ${org.id}`);
    res.json({ success: true });
  } catch (err: any) {
    console.error('[SETTINGS ERROR] POST /ai:', err.message, err.stack);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
