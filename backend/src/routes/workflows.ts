import prisma from '../db';
import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createWorkflowSchema } from '../schemas';
import { recordAuditLog } from '../utils/audit';

const router = Router();

// GET /api/workflows - list workflows
router.get('/', async (req: any, res: any) => {
  const orgId = req.orgId;
  const skip = parseInt(req.query.skip as string) || 0;
  const take = parseInt(req.query.take as string) || 50;

  try {
    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { runs: true }
          }
        },
        skip,
        take,
      }),
      prisma.workflow.count({ where: { organizationId: orgId } })
    ]);
    res.json({ success: true, data: { workflows, total, skip, take } });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to fetch workflows' });
  }
});

// POST /api/workflows - create workflow
router.post('/', validate(createWorkflowSchema), async (req: any, res: any) => {
  const orgId = req.orgId;
  try {
    const { name, description, trigger, definition } = req.body;
    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        trigger,
        definition: JSON.stringify(definition || []),
        organizationId: orgId,
        status: 'draft'
      }
    });

    // Record Audit Log
    await recordAuditLog({
      orgId: orgId,
      userId: req.auth?.sub || 'system',
      action: 'workflow_created',
      entityType: 'Workflow',
      entityId: workflow.id,
      details: { name: workflow.name, trigger: workflow.trigger }
    });

    res.status(201).json({ success: true, data: { workflow } });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to create workflow' });
  }
});

export default router;
