import prisma from '../db';
import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createToolSchema } from '../schemas';
import { recordAuditLog } from '../utils/audit';

const router = Router();

// GET /api/tools - list tools
router.get('/', async (req: any, res: any) => {
  const orgId = req.orgId;
  const skip = parseInt(req.query.skip as string) || 0;
  const take = parseInt(req.query.take as string) || 50;

  try {
    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.tool.count({ where: { organizationId: orgId } })
    ]);

    res.json({ success: true, data: { tools, total, skip, take } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/tools - create tool
router.post('/', validate(createToolSchema), async (req: any, res: any) => {
  const orgId = req.orgId;
  try {
    const { name, description, type, config } = req.body;

    const tool = await prisma.tool.create({
      data: {
        name,
        description,
        type,
        config: JSON.stringify(config || {}),
        organizationId: orgId
      }
    });

    // Record Audit Log
    await recordAuditLog({
      orgId: orgId,
      userId: req.auth?.sub || 'system',
      action: 'tool_created',
      entityType: 'Tool',
      entityId: tool.id,
      details: { name: tool.name, type: tool.type }
    });

    res.status(201).json({ success: true, data: { tool } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
