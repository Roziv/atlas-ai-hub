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
// GET /api/violations - List all violations
router.get('/', async (req, res) => {
    const orgId = req.orgId;
    const { modelId, policyId, status } = req.query;
    const skip = parseInt(req.query.skip) || 0;
    const take = parseInt(req.query.take) || 50;
    try {
        const where = {
            organizationId: orgId,
            modelId: modelId ? String(modelId) : undefined,
            policyId: policyId ? String(policyId) : undefined,
            status: status ? String(status) : undefined,
        };
        const [violations, total] = await Promise.all([
            db_1.default.violation.findMany({
                where,
                include: {
                    model: {
                        select: { id: true, name: true, type: true, owner: true }
                    },
                    policy: {
                        select: { id: true, name: true, scope: true }
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            db_1.default.violation.count({ where })
        ]);
        res.json({
            success: true,
            data: { violations, total, skip, take },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// GET /api/violations/:id - Get single violation details
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const orgId = req.orgId;
    try {
        const violation = await db_1.default.violation.findFirst({
            where: { id, organizationId: orgId },
            include: {
                model: {
                    include: { owner: true }
                },
                policy: true,
            },
        });
        if (!violation) {
            return res.status(404).json({ success: false, error: 'Violation not found' });
        }
        res.json({
            success: true,
            data: { violation },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// PATCH /api/violations/:id - Remediate/Resolve a violation
router.patch('/:id', (0, validate_1.validate)(schemas_1.updateViolationSchema), async (req, res) => {
    const { id } = req.params;
    const orgId = req.orgId;
    const { status, remediation } = req.body;
    try {
        const result = await db_1.default.violation.updateMany({
            where: { id, organizationId: orgId },
            data: {
                status: status || 'remediated',
                remediation: remediation || null,
                resolvedAt: new Date()
            }
        });
        if (result.count === 0) {
            return res.status(404).json({ success: false, error: 'Violation not found' });
        }
        const violation = await db_1.default.violation.findUnique({
            where: { id },
            include: { model: true, policy: true }
        });
        if (violation) {
            // Record Audit Log
            await (0, audit_1.recordAuditLog)({
                orgId: orgId,
                userId: req.auth?.sub || 'manager',
                action: 'violation_remediated',
                entityType: 'Violation',
                entityId: violation.id,
                details: {
                    status: violation.status,
                    model: violation.model.name,
                    policy: violation.policy.name
                }
            });
        }
        res.json({ success: true, data: { violation } });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
