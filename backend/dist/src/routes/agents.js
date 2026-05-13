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
// GET /api/agents - list agents
router.get('/', async (req, res) => {
    const orgId = req.orgId;
    const skip = parseInt(req.query.skip) || 0;
    const take = parseInt(req.query.take) || 50;
    try {
        const [agents, total] = await Promise.all([
            db_1.default.agent.findMany({
                where: { organizationId: orgId, isDeleted: false },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            db_1.default.agent.count({ where: { organizationId: orgId, isDeleted: false } })
        ]);
        res.json({ success: true, data: { agents, total, skip, take } });
    }
    catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});
// POST /api/agents - create agent
router.post('/', (0, validate_1.validate)(schemas_1.createAgentSchema), async (req, res) => {
    const orgId = req.orgId;
    try {
        const { name, description, definition, category, icon } = req.body;
        const agent = await db_1.default.agent.create({
            data: {
                name,
                description,
                definition: JSON.stringify(definition || {}),
                category: category || 'General',
                icon: icon || 'bot',
                organizationId: orgId,
                creatorId: req.auth?.sub || undefined,
            }
        });
        // Record Audit Log
        await (0, audit_1.recordAuditLog)({
            orgId: orgId,
            userId: req.auth?.sub || 'system',
            action: 'agent_created',
            entityType: 'Agent',
            entityId: agent.id,
            details: { name: agent.name, category: agent.category }
        });
        res.status(201).json({ success: true, data: { agent } });
    }
    catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});
exports.default = router;
