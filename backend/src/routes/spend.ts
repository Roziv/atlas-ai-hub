import prisma from '../db';
import { Router } from 'express';

const router = Router();

// GET /api/spend - list spend records (optional query params: provider, startDate, endDate, skip, take)
router.get('/', async (req: any, res: any) => {
  const orgId = req.orgId;
  const { provider, startDate, endDate } = req.query;
  const skip = parseInt(req.query.skip as string) || 0;
  const take = parseInt(req.query.take as string) || 50;

  const where: any = { organizationId: orgId };
  if (provider) where.provider = String(provider);
  if (startDate || endDate) {
    where.recordDate = {};
    if (startDate) where.recordDate.gte = new Date(String(startDate));
    if (endDate) where.recordDate.lte = new Date(String(endDate));
  }
  try {
    const [spend, total] = await Promise.all([
      prisma.spendRecord.findMany({
        where,
        orderBy: { recordDate: 'desc' },
        skip,
        take,
      }),
      prisma.spendRecord.count({ where })
    ]);
    res.json({ success: true, data: { spend, total, skip, take } });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to fetch spend records' });
  }
});

// GET /api/spend/stats - Comprehensive financial overview
router.get('/stats', async (req: any, res: any) => {
  const orgId = req.orgId;
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Total MTD
    const mtdAgg = await prisma.spendRecord.aggregate({
      where: { organizationId: orgId, recordDate: { gte: startOfMonth } },
      _sum: { amount: true }
    });
    const mtdTotal = mtdAgg._sum.amount || 0;

    // 2. Projected EOM (Simple linear projection)
    const daysPassed = now.getDate();
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projectedEom = daysPassed > 0 ? (mtdTotal / daysPassed) * totalDays : 0;

    // 3. Provider Shares
    const providerAgg = await prisma.spendRecord.groupBy({
      by: ['provider'],
      where: { organizationId: orgId, recordDate: { gte: startOfMonth } },
      _sum: { amount: true }
    });
    const providers = providerAgg.map(a => ({
      name: a.provider,
      spend: a._sum.amount || 0,
      share: mtdTotal > 0 ? Math.round(((a._sum.amount || 0) / mtdTotal) * 100) : 0
    })).sort((a, b) => b.spend - a.spend);

    // 4. Daily Spend (30 days)
    const dailyAgg = await prisma.spendRecord.groupBy({
      by: ['recordDate'],
      where: { organizationId: orgId, recordDate: { gte: last30Days } },
      _sum: { amount: true },
      orderBy: { recordDate: 'asc' }
    });

    res.json({
      success: true,
      data: {
        mtdTotal,
        projectedEom,
        providers,
        dailySpend: dailyAgg.map(d => ({ date: d.recordDate, amount: d._sum.amount }))
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to calculate financial stats' });
  }
});
export default router;
