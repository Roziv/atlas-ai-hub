import express from 'express';
import prisma from '../db';
import { recordAuditLog } from '../utils/audit';

import { validate } from '../middleware/validate';
import { createPolicySchema } from '../schemas';

const router = express.Router();

// GET /api/policies - List all policies
router.get('/', async (req: any, res: any) => {
  const orgId = req.orgId;
  const skip = parseInt(req.query.skip as string) || 0;
  const take = parseInt(req.query.take as string) || 50;

  try {
    const [policies, total] = await Promise.all([
      prisma.policy.findMany({
        where: { organizationId: orgId, isDeleted: false },
        include: {
          organization: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      }),
      prisma.policy.count({
        where: { organizationId: orgId, isDeleted: false }
      })
    ]);

    res.json({
      success: true,
      data: { policies, total, skip, take },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/policies/:id - Get single policy details
router.get('/:id', async (req: any, res: any) => {
  const { id } = req.params;
  const orgId = req.orgId;

  try {
    const policy = await prisma.policy.findFirst({
      where: { id, organizationId: orgId },
      include: {
        organization: true,
        violations: {
          include: { model: true }
        },
      },
    });

    if (!policy || policy.isDeleted) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }

    res.json({
      success: true,
      data: { policy },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/policies - Create a new policy
router.post('/', validate(createPolicySchema), async (req: any, res: any) => {
  const orgId = req.orgId;
  const { name, description, scope, rules, createdById } = req.body;

  try {
    const policy = await prisma.policy.create({
      data: {
        name,
        description: description || null,
        scope: scope || 'all_production',
        rules: rules ? JSON.stringify(rules) : '[]',
        createdById,
        organizationId: orgId,
      },
    });

    // Record Audit Log
    await recordAuditLog({
      orgId: orgId,
      userId: req.auth?.sub || createdById,
      action: 'policy_created',
      entityType: 'Policy',
      entityId: policy.id,
      details: { name: policy.name, scope: policy.scope }
    });

    res.status(201).json({
      success: true,
      data: { policy },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/policies/:id - Soft delete a policy
router.delete('/:id', async (req: any, res: any) => {
  const { id } = req.params;
  const orgId = req.orgId;

  try {
    const result = await prisma.policy.updateMany({
      where: { id, organizationId: orgId },
      data: { isDeleted: true },
    });

    if (result.count === 0) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }

    // Record Audit Log
    await recordAuditLog({
      orgId: orgId,
      userId: req.auth?.sub || 'manager',
      action: 'policy_deleted',
      entityType: 'Policy',
      entityId: id,
      details: { policyId: id }
    });

    res.json({ success: true, message: 'Policy archived successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
