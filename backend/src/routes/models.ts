import express from 'express';
import prisma from '../db';
import { recordAuditLog } from '../utils/audit';

import { validate } from '../middleware/validate';
import { createModelSchema, updateModelSchema } from '../schemas';

const router = express.Router();

// GET /api/models - List all models
router.get('/', async (req: any, res: any) => {
  const orgId = req.orgId;
  const skip = parseInt(req.query.skip as string) || 0;
  const take = parseInt(req.query.take as string) || 50;

  try {
    const [models, total] = await Promise.all([
      prisma.model.findMany({
        where: { organizationId: orgId, isDeleted: false },
        include: {
          owner: {
            select: { id: true, name: true, email: true, avatarUrl: true }
          },
          violations: {
            where: { status: 'open' },
            select: { id: true, severity: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.model.count({
        where: { organizationId: orgId, isDeleted: false }
      })
    ]);

    res.json({
      success: true,
      data: { models, total, skip, take },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/models - Create a new model
router.post('/', validate(createModelSchema), async (req: any, res: any) => {
  const orgId = req.orgId;
  const { name, description, type, ownerId, metadata } = req.body;

  try {
    const model = await prisma.model.create({
      data: {
        name,
        description: description || null,
        type,
        ownerId,
        organizationId: orgId,
        metadata: metadata ? JSON.stringify(metadata) : '{}',
      },
      include: {
        owner: true
      }
    });

    // Record Audit Log
    await recordAuditLog({
        orgId: orgId,
        userId: req.auth?.sub || ownerId,
        action: 'model_created',
        entityType: 'Model',
        entityId: model.id,
        details: { name: model.name, type: model.type }
    });

    res.status(201).json({
      success: true,
      data: { model },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/models/:id - Get single model details
router.get('/:id', async (req: any, res: any) => {
  const { id } = req.params;
  const orgId = req.orgId;

  try {
    const model = await prisma.model.findFirst({
      where: { id, organizationId: orgId },
      include: {
        owner: true,
        organization: true,
        violations: {
          include: { policy: true }
        },
        policyApplications: {
          include: { policy: true }
        },
      },
    });

    if (!model || model.isDeleted) {
      return res.status(404).json({ success: false, error: 'Model not found' });
    }

    res.json({
      success: true,
      data: { model },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/models/:id - Soft delete a model
router.delete('/:id', async (req: any, res: any) => {
    const { id } = req.params;
    const orgId = req.orgId;
  
    try {
      const model = await prisma.model.updateMany({
        where: { id, organizationId: orgId },
        data: { isDeleted: true },
      });
  
      if (model.count === 0) {
        return res.status(404).json({ success: false, error: 'Model not found' });
      }

      // Record Audit Log
      await recordAuditLog({
        orgId: orgId,
        userId: req.auth?.sub || 'manager',
        action: 'model_deleted',
        entityType: 'Model',
        entityId: id,
        details: { modelId: id }
      });
  
      res.json({ success: true, message: 'Model archived successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

// PATCH /api/models/:id - Update model details
router.patch('/:id', validate(updateModelSchema), async (req: any, res: any) => {
    const { id } = req.params;
    const orgId = req.orgId;
    const { name, description, status, metadata } = req.body;
  
    try {
      const model = await prisma.model.updateMany({
        where: { id, organizationId: orgId },
        data: { 
            name,
            description,
            status,
            metadata: metadata ? JSON.stringify(metadata) : undefined
        },
      });
  
      if (model.count === 0) {
        return res.status(404).json({ success: false, error: 'Model not found' });
      }

      // Record Audit Log
      await recordAuditLog({
        orgId: orgId,
        userId: req.auth?.sub || 'manager',
        action: 'model_updated',
        entityType: 'Model',
        entityId: id,
        details: { status }
      });
  
      res.json({ success: true, message: 'Model updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
