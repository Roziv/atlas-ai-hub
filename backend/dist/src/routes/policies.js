"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const audit_1 = require("../utils/audit");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../schemas");
const router = express_1.default.Router();
// GET /api/policies - List all policies
router.get('/', async (req, res) => {
    const orgId = req.orgId;
    const skip = parseInt(req.query.skip) || 0;
    const take = parseInt(req.query.take) || 50;
    try {
        const [policies, total] = await Promise.all([
            db_1.default.policy.findMany({
                where: { organizationId: orgId, isDeleted: false },
                include: {
                    organization: true,
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take,
            }),
            db_1.default.policy.count({
                where: { organizationId: orgId, isDeleted: false }
            })
        ]);
        res.json({
            success: true,
            data: { policies, total, skip, take },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// GET /api/policies/:id - Get single policy details
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const orgId = req.orgId;
    try {
        const policy = await db_1.default.policy.findFirst({
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
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// POST /api/policies - Create a new policy
router.post('/', (0, validate_1.validate)(schemas_1.createPolicySchema), async (req, res) => {
    const orgId = req.orgId;
    const { name, description, scope, rules, createdById } = req.body;
    try {
        const policy = await db_1.default.policy.create({
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
        await (0, audit_1.recordAuditLog)({
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
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// DELETE /api/policies/:id - Soft delete a policy
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const orgId = req.orgId;
    try {
        const result = await db_1.default.policy.updateMany({
            where: { id, organizationId: orgId },
            data: { isDeleted: true },
        });
        if (result.count === 0) {
            return res.status(404).json({ success: false, error: 'Policy not found' });
        }
        // Record Audit Log
        await (0, audit_1.recordAuditLog)({
            orgId: orgId,
            userId: req.auth?.sub || 'manager',
            action: 'policy_deleted',
            entityType: 'Policy',
            entityId: id,
            details: { policyId: id }
        });
        res.json({ success: true, message: 'Policy archived successfully' });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
