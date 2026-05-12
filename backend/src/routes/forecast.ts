import prisma from '../db';
import { Router } from 'express';

const router = Router();

// GET /api/forecast - Real-ish linear forecasting data based on last 30 days
router.get('/', async (req: any, res: any) => {
  const orgId = req.orgId;
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch last 30 days of spend
    const spend = await prisma.spendRecord.aggregate({
      where: { organizationId: orgId, recordDate: { gte: thirtyDaysAgo } },
      _sum: { amount: true }
    });

    const mtdTotal = spend._sum.amount || 0;
    const dailyAvg = mtdTotal / 30;
    const annualBase = dailyAvg * 365;

    const formatCurrency = (val: number) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
        return `$${val.toFixed(0)}`;
    };

    const scenarios = [
      { name: 'Conservative', total: formatCurrency(annualBase * 0.85), delta: '-15%', kind: 'ok', desc: 'Current trajectory + 15% optimization target' },
      { name: 'Base', total: formatCurrency(annualBase), delta: '0%', kind: 'ok', desc: 'Linear extrapolation of last 30 days spend', selected: true },
      { name: 'Aggressive', total: formatCurrency(annualBase * 1.5), delta: '+50%', kind: 'warn', desc: 'Planned expansion into all business units by Q4' },
    ];
    res.json({ success: true, data: scenarios });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to calculate forecast data' });
  }
});

export default router;
