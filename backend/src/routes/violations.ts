import express from 'express';
import prisma from '../db';
import { recordAuditLog } from '../utils/audit';

import { validate } from '../middleware/validate';
import { updateViolationSchema } from '../schemas';

const router = express.Router();

// GET /api/violations - List all violations
router.get('/', async (req: any, res: any) => {
  const orgId = req.orgId;
  const { modelId, policyId, status } = req.query;
  const skip = parseInt(req.query.skip as string) || 0;
  const take = parseInt(req.query.take as string) || 50;

  try {
    const where = {
        organizationId: orgId,
        modelId: modelId ? String(modelId) : undefined,
        policyId: policyId ? String(policyId) : undefined,
        status: status ? String(status) : undefined,
    };

    const [violations, total] = await Promise.all([
      prisma.violation.findMany({
        where,
        include: {
          model: {
            select: { id: true, name: true, type: true, owner: true }
          },
          policy: {
            select: { id: true, name: true, scope: true }
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.violation.count({ where })
    ]);

    res.json({
      success: true,
      data: { violations, total, skip, take },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/violations/:id - Get single violation details
router.get('/:id', async (req: any, res: any) => {
  const { id } = req.params;
  const orgId = req.orgId;

  try {
    const violation = await prisma.violation.findFirst({
      where: { id, organizationId: orgId },
      include: {
        model: {
          include: { owner: true }
        },
        policy: true,
      },
    });

    if (!violation) {
      return res.status(404).json({ success: false, error: 'Violation not found' });
    }

    res.json({
      success: true,
      data: { violation },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/violations/:id - Remediate/Resolve a violation
router.patch('/:id', validate(updateViolationSchema), async (req: any, res: any) => {
    const { id } = req.params;
    const orgId = req.orgId;
    const { status, remediation } = req.body;
  
    try {
      const result = await prisma.violation.updateMany({
        where: { id, organizationId: orgId },
        data: { 
            status: status || 'remediated',
            remediation: remediation || null,
            resolvedAt: new Date()
        }
      });
  
      if (result.count === 0) {
        return res.status(404).json({ success: false, error: 'Violation not found' });
      }

      const violation = await prisma.violation.findUnique({
          where: { id },
          include: { model: true, policy: true }
      });

      if (violation) {
          // Record Audit Log
          await recordAuditLog({
            orgId: orgId,
            userId: req.auth?.sub || 'manager',
            action: 'violation_remediated',
            entityType: 'Violation',
            entityId: violation.id,
            details: { 
                status: violation.status, 
                model: violation.model.name,
                policy: violation.policy.name
            }
          });
      }
  
      res.json({ success: true, data: { violation } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
