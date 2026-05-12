import express from 'express';
import prisma from '../db';
import { recordAuditLog } from '../utils/audit';

import { validate } from '../middleware/validate';
import { createRagResourceSchema } from '../schemas';

const router = express.Router();

// GET /api/rag - List knowledge resources with filters
router.get('/', async (req: any, res: any) => {
  const orgId = req.orgId;
  const { userId, isGeneral } = req.query;
  const skip = parseInt(req.query.skip as string) || 0;
  const take = parseInt(req.query.take as string) || 50;

  try {
    const where: any = { organizationId: orgId };
    if (userId) where.createdById = String(userId);
    if (isGeneral === 'true') where.isGeneral = true;
    else if (isGeneral === 'false') where.isGeneral = false;

    const [resources, total] = await Promise.all([
      prisma.ragResource.findMany({
        where,
        include: {
          distributions: {
            include: { model: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      }),
      prisma.ragResource.count({ where })
    ]);

    res.json({
      success: true,
      data: { resources, total, skip, take },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/rag - Create a new knowledge resource
router.post('/', validate(createRagResourceSchema), async (req: any, res: any) => {
  const orgId = req.orgId;
  const { name, description, type, contentUrl, userId } = req.body;

  try {
    const resource = await prisma.ragResource.create({
      data: {
        name,
        description: description || null,
        type,
        contentUrl: contentUrl || null,
        organizationId: orgId,
        createdById: userId || null,
        isGeneral: req.body.isGeneral || false,
      },
    });

    // Record Audit Log
    await recordAuditLog({
      orgId: orgId,
      userId: req.auth?.sub || userId || 'system',
      action: 'rag_resource_created',
      entityType: 'RagResource',
      entityId: resource.id,
      details: { name: resource.name, type: resource.type }
    });

    res.status(201).json({
      success: true,
      data: { resource },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/rag/distribute - Assign a resource to a model
router.post('/distribute', async (req: any, res: any) => {
    const orgId = req.orgId;
    const { ragResourceId, modelId, userId } = req.body;

    try {
        const distribution = await prisma.ragDistribution.create({
            data: {
                ragResourceId,
                modelId,
                organizationId: orgId,
                version: 'v1.0'
            },
            include: {
                ragResource: true,
                model: true
            }
        });

        // Record Audit Log
        await recordAuditLog({
            orgId: orgId,
            userId: req.auth?.sub || userId || 'system',
            action: 'rag_distributed',
            entityType: 'RagResource',
            entityId: ragResourceId,
            details: { model: distribution.model.name, resource: distribution.ragResource.name }
        });

        res.status(201).json({
            success: true,
            data: { distribution },
        });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
