import prisma from '../db';
import { Router } from 'express';
import { recordAuditLog } from '../utils/audit';

import { validate } from '../middleware/validate';
import { createBudgetSchema, updateBudgetSchema } from '../schemas';

const router = Router();

// GET /api/budgets - list budgets
router.get('/', async (req: any, res: any) => {
  const orgId = req.orgId;
  const skip = parseInt(req.query.skip as string) || 0;
  const take = parseInt(req.query.take as string) || 50;

  try {
    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.budget.count({ where: { organizationId: orgId } })
    ]);
    res.json({ success: true, data: { budgets, total, skip, take } });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to fetch budgets' });
  }
});

// POST /api/budgets - create or update a budget
router.post('/', validate(createBudgetSchema), async (req: any, res: any) => {
  const orgId = req.orgId;
  try {
    const { name, department, monthlyLimit, alertThreshold } = req.body;
    
    const budget = await prisma.budget.create({
      data: {
        name,
        department,
        monthlyLimit,
        alertThreshold,
        organizationId: orgId
      }
    });

    // Record Audit Log
    await recordAuditLog({
      orgId: orgId,
      userId: req.auth?.sub || 'cfo_system', 
      action: 'budget_created',
      entityType: 'Budget',
      entityId: budget.id,
      details: { name: budget.name, limit: budget.monthlyLimit, dept: budget.department }
    });

    res.json({ success: true, data: budget });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', async (req: any, res: any) => {
  const { id } = req.params;
  const orgId = req.orgId;
  try {
    const result = await prisma.budget.deleteMany({ 
      where: { id, organizationId: orgId } 
    });
    
    if (result.count === 0) {
      return res.status(404).json({ success: false, error: 'Budget not found' });
    }

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// PATCH /api/budgets/:id - Update budget details
router.patch('/:id', validate(updateBudgetSchema), async (req: any, res: any) => {
    const { id } = req.params;
    const orgId = req.orgId;
    const { name, monthlyLimit, alertThreshold, isActive } = req.body;
  
    try {
      const result = await prisma.budget.updateMany({
        where: { id, organizationId: orgId },
        data: { 
            name,
            monthlyLimit,
            alertThreshold,
            isActive
        },
      });
  
      if (result.count === 0) {
        return res.status(404).json({ success: false, error: 'Budget not found' });
      }

      const budget = await prisma.budget.findUnique({ where: { id } });

      if (budget) {
          // Record Audit Log
          await recordAuditLog({
            orgId: orgId,
            userId: req.auth?.sub || 'cfo_system',
            action: 'budget_updated',
            entityType: 'Budget',
            entityId: budget.id,
            details: { name: budget.name, limit: budget.monthlyLimit }
          });
      }
  
      res.json({ success: true, data: { budget } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
