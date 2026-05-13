"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
const express_1 = require("express");
const audit_1 = require("../utils/audit");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../schemas");
const router = (0, express_1.Router)();
// GET /api/budgets - list budgets
router.get('/', async (req, res) => {
    const orgId = req.orgId;
    const skip = parseInt(req.query.skip) || 0;
    const take = parseInt(req.query.take) || 50;
    try {
        const [budgets, total] = await Promise.all([
            db_1.default.budget.findMany({
                where: { organizationId: orgId },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            db_1.default.budget.count({ where: { organizationId: orgId } })
        ]);
        res.json({ success: true, data: { budgets, total, skip, take } });
    }
    catch (e) {
        res.status(500).json({ success: false, error: 'Failed to fetch budgets' });
    }
});
// POST /api/budgets - create or update a budget
router.post('/', (0, validate_1.validate)(schemas_1.createBudgetSchema), async (req, res) => {
    const orgId = req.orgId;
    try {
        const { name, department, monthlyLimit, alertThreshold } = req.body;
        const budget = await db_1.default.budget.create({
            data: {
                name,
                department,
                monthlyLimit,
                alertThreshold,
                organizationId: orgId
            }
        });
        // Record Audit Log
        await (0, audit_1.recordAuditLog)({
            orgId: orgId,
            userId: req.auth?.sub || 'cfo_system',
            action: 'budget_created',
            entityType: 'Budget',
            entityId: budget.id,
            details: { name: budget.name, limit: budget.monthlyLimit, dept: budget.department }
        });
        res.json({ success: true, data: budget });
    }
    catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});
// DELETE /api/budgets/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const orgId = req.orgId;
    try {
        const result = await db_1.default.budget.deleteMany({
            where: { id, organizationId: orgId }
        });
        if (result.count === 0) {
            return res.status(404).json({ success: false, error: 'Budget not found' });
        }
        res.json({ success: true });
    }
    catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});
// PATCH /api/budgets/:id - Update budget details
router.patch('/:id', (0, validate_1.validate)(schemas_1.updateBudgetSchema), async (req, res) => {
    const { id } = req.params;
    const orgId = req.orgId;
    const { name, monthlyLimit, alertThreshold, isActive } = req.body;
    try {
        const result = await db_1.default.budget.updateMany({
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
        const budget = await db_1.default.budget.findUnique({ where: { id } });
        if (budget) {
            // Record Audit Log
            await (0, audit_1.recordAuditLog)({
                orgId: orgId,
                userId: req.auth?.sub || 'cfo_system',
                action: 'budget_updated',
                entityType: 'Budget',
                entityId: budget.id,
                details: { name: budget.name, limit: budget.monthlyLimit }
            });
        }
        res.json({ success: true, data: { budget } });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
