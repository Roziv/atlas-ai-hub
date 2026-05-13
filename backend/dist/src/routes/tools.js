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
// GET /api/tools - list tools
router.get('/', async (req, res) => {
    const orgId = req.orgId;
    const skip = parseInt(req.query.skip) || 0;
    const take = parseInt(req.query.take) || 50;
    try {
        const [tools, total] = await Promise.all([
            db_1.default.tool.findMany({
                where: { organizationId: orgId },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            db_1.default.tool.count({ where: { organizationId: orgId } })
        ]);
        res.json({ success: true, data: { tools, total, skip, take } });
    }
    catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});
// POST /api/tools - create tool
router.post('/', (0, validate_1.validate)(schemas_1.createToolSchema), async (req, res) => {
    const orgId = req.orgId;
    try {
        const { name, description, type, config } = req.body;
        const tool = await db_1.default.tool.create({
            data: {
                name,
                description,
                type,
                config: JSON.stringify(config || {}),
                organizationId: orgId
            }
        });
        // Record Audit Log
        await (0, audit_1.recordAuditLog)({
            orgId: orgId,
            userId: req.auth?.sub || 'system',
            action: 'tool_created',
            entityType: 'Tool',
            entityId: tool.id,
            details: { name: tool.name, type: tool.type }
        });
        res.status(201).json({ success: true, data: { tool } });
    }
    catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});
exports.default = router;
