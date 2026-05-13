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
// GET /api/rag - List knowledge resources with filters
router.get('/', async (req, res) => {
    const orgId = req.orgId;
    const { userId, isGeneral } = req.query;
    const skip = parseInt(req.query.skip) || 0;
    const take = parseInt(req.query.take) || 50;
    try {
        const where = { organizationId: orgId };
        if (userId)
            where.createdById = String(userId);
        if (isGeneral === 'true')
            where.isGeneral = true;
        else if (isGeneral === 'false')
            where.isGeneral = false;
        const [resources, total] = await Promise.all([
            db_1.default.ragResource.findMany({
                where,
                include: {
                    distributions: {
                        include: { model: true }
                    }
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take,
            }),
            db_1.default.ragResource.count({ where })
        ]);
        res.json({
            success: true,
            data: { resources, total, skip, take },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// POST /api/rag - Create a new knowledge resource
router.post('/', (0, validate_1.validate)(schemas_1.createRagResourceSchema), async (req, res) => {
    const orgId = req.orgId;
    const { name, description, type, contentUrl, userId } = req.body;
    try {
        const resource = await db_1.default.ragResource.create({
            data: {
                name,
                description: description || null,
                type,
                contentUrl: contentUrl || null,
                organizationId: orgId,
                createdById: userId || null,
                isGeneral: req.body.isGeneral || false,
            },
        });
        // Record Audit Log
        await (0, audit_1.recordAuditLog)({
            orgId: orgId,
            userId: req.auth?.sub || userId || 'system',
            action: 'rag_resource_created',
            entityType: 'RagResource',
            entityId: resource.id,
            details: { name: resource.name, type: resource.type }
        });
        res.status(201).json({
            success: true,
            data: { resource },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// POST /api/rag/distribute - Assign a resource to a model
router.post('/distribute', async (req, res) => {
    const orgId = req.orgId;
    const { ragResourceId, modelId, userId } = req.body;
    try {
        const distribution = await db_1.default.ragDistribution.create({
            data: {
                ragResourceId,
                modelId,
                organizationId: orgId,
                version: 'v1.0'
            },
            include: {
                ragResource: true,
                model: true
            }
        });
        // Record Audit Log
        await (0, audit_1.recordAuditLog)({
            orgId: orgId,
            userId: req.auth?.sub || userId || 'system',
            action: 'rag_distributed',
            entityType: 'RagResource',
            entityId: ragResourceId,
            details: { model: distribution.model.name, resource: distribution.ragResource.name }
        });
        res.status(201).json({
            success: true,
            data: { distribution },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
