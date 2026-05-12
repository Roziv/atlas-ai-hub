import prisma from '../db';
import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createAgentSchema } from '../schemas';
import { recordAuditLog } from '../utils/audit';

const router = Router();

// GET /api/agents - list agents
router.get('/', async (req: any, res: any) => {
  const orgId = req.orgId;
  const skip = parseInt(req.query.skip as string) || 0;
  const take = parseInt(req.query.take as string) || 50;

  try {
    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where: { organizationId: orgId, isDeleted: false },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.agent.count({ where: { organizationId: orgId, isDeleted: false } })
    ]);

    res.json({ success: true, data: { agents, total, skip, take } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/agents - create agent
router.post('/', validate(createAgentSchema), async (req: any, res: any) => {
  const orgId = req.orgId;
  try {
    const { name, description, definition, category, icon } = req.body;

    const agent = await prisma.agent.create({
      data: {
        name,
        description,
        definition: JSON.stringify(definition || {}),
        category: category || 'General',
        icon: icon || 'bot',
        organizationId: orgId,
        creatorId: req.auth?.sub || undefined,
      }
    });

    // Record Audit Log
    await recordAuditLog({
      orgId: orgId,
      userId: req.auth?.sub || 'system',
      action: 'agent_created',
      entityType: 'Agent',
      entityId: agent.id,
      details: { name: agent.name, category: agent.category }
    });

    res.status(201).json({ success: true, data: { agent } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
