import { Router } from 'express';
import prisma from '../db';

const router = Router();

// GET global AI settings
router.get('/ai', async (req, res) => {
  try {
    const orgId = (req as any).orgId;
    console.log(`[SETTINGS] GET /ai - orgId: ${orgId}`);

    let org = await prisma.organization.findUnique({
      where: { id: orgId }
    });

    if (!org) {
      console.log(`[SETTINGS] Organization not found with id ${orgId}, searching all organizations`);
      org = await prisma.organization.findFirst();
    }

    if (!org) {
      console.error('[SETTINGS] No organizations found in database');
      return res.status(404).json({ success: false, error: 'Org not found' });
    }

    console.log(`[SETTINGS] Found organization: ${org.id}`);
    const settings = JSON.parse(org.settings || '{}');
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
    res.json({ success: true, data: settings.ai || defaultAi });
  } catch (err: any) {
    console.error('[SETTINGS ERROR]', err.message, err.stack);
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE global AI settings
router.post('/ai', async (req, res) => {
  try {
    const { aiSettings } = req.body;
    const orgId = (req as any).orgId;
    console.log(`[SETTINGS] POST /ai - orgId: ${orgId}`);

    let org = await prisma.organization.findUnique({
      where: { id: orgId }
    });

    if (!org) {
      console.log(`[SETTINGS] Organization not found with id ${orgId}, searching all organizations`);
      org = await prisma.organization.findFirst();
    }

    if (!org) {
      console.error('[SETTINGS] No organizations found in database');
      return res.status(404).json({ success: false, error: 'Org not found' });
    }

    const currentSettings = JSON.parse(org.settings || '{}');
    const updatedSettings = { ...currentSettings, ai: aiSettings };

    await prisma.organization.update({
      where: { id: org.id },
      data: { settings: JSON.stringify(updatedSettings) }
    });

    console.log(`[SETTINGS] Successfully updated settings for org: ${org.id}`);
    res.json({ success: true });
  } catch (err: any) {
    console.error('[SETTINGS ERROR]', err.message, err.stack);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
