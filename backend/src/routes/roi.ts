import express from 'express';
import prisma from '../db';

const router = express.Router();

// GET /api/roi - Dynamic ROI data per initiative
router.get('/', async (req: any, res: any) => {
  const orgId = req.orgId;
  try {
    const initiatives = [
      { id: 'support', name: 'Support deflection bot', team: 'Support', manualCost: 15.0 }, // $15 per manual ticket
      { id: 'sales', name: 'Sales research agent', team: 'Sales', manualCost: 45.0 },    // $45 per lead research
      { id: 'legal', name: 'Contract review', team: 'Legal', manualCost: 120.0 },      // $120 per contract
    ];

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const results = await Promise.all(initiatives.map(async (init) => {
        // Fetch MTD spend for this 'department'
        const spendAgg = await prisma.spendRecord.aggregate({
            _sum: { amount: true },
            _count: { id: true },
            where: { 
                department: init.team, 
                organizationId: orgId,
                recordDate: { gte: startOfMonth }
            }
        });

        const invested = spendAgg._sum.amount || 1; // Avoid division by zero
        const usageCount = spendAgg._count.id || 0;
        const totalValue = usageCount * init.manualCost;
        const roiVal = totalValue / invested;

        return {
            ...init,
            invested: Math.round(invested),
            value: Math.round(totalValue),
            roi: roiVal.toFixed(1) + '×',
            usage: usageCount,
            status: roiVal > 2 ? 'ok' : 'warn'
        };
    }));

    res.json({ success: true, data: results });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to fetch ROI data' });
  }
});

export default router;
