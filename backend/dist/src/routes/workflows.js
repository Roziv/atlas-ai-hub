"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
const express_1 = require("express");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../schemas");
const audit_1 = require("../utils/audit");
const router = (0, express_1.Router)();
// GET /api/workflows - list workflows
router.get('/', async (req, res) => {
    const orgId = req.orgId;
    const skip = parseInt(req.query.skip) || 0;
    const take = parseInt(req.query.take) || 50;
    try {
        const [workflows, total] = await Promise.all([
            db_1.default.workflow.findMany({
                where: { organizationId: orgId },
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { runs: true }
                    }
                },
                skip,
                take,
            }),
            db_1.default.workflow.count({ where: { organizationId: orgId } })
        ]);
        res.json({ success: true, data: { workflows, total, skip, take } });
    }
    catch (e) {
        res.status(500).json({ success: false, error: 'Failed to fetch workflows' });
    }
});
// POST /api/workflows - create workflow
router.post('/', (0, validate_1.validate)(schemas_1.createWorkflowSchema), async (req, res) => {
    const orgId = req.orgId;
    try {
        const { name, description, trigger, definition } = req.body;
        const workflow = await db_1.default.workflow.create({
            data: {
                name,
                description,
                trigger,
                definition: JSON.stringify(definition || []),
                organizationId: orgId,
                status: 'draft'
            }
        });
        // Record Audit Log
        await (0, audit_1.recordAuditLog)({
            orgId: orgId,
            userId: req.auth?.sub || 'system',
            action: 'workflow_created',
            entityType: 'Workflow',
            entityId: workflow.id,
            details: { name: workflow.name, trigger: workflow.trigger }
        });
        res.status(201).json({ success: true, data: { workflow } });
    }
    catch (e) {
        res.status(500).json({ success: false, error: 'Failed to create workflow' });
    }
});
exports.default = router;
