import express from 'express';
import prisma from '../db';

const router = express.Router();

// GET /api/audit - List recent audit logs
router.get('/', async (req: any, res: any) => {
  const orgId = req.orgId;
  const skip = parseInt(req.query.skip as string) || 0;
  const take = parseInt(req.query.take as string) || 50;

  try {
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { organizationId: orgId },
        skip,
        take,
        include: {
          user: {
            select: { name: true, avatarUrl: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({
        where: { organizationId: orgId }
      })
    ]);

    res.json({
      success: true,
      data: { logs, total, skip, take },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
