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
// GET /api/models - List all models
router.get('/', async (req, res) => {
    const orgId = req.orgId;
    const skip = parseInt(req.query.skip) || 0;
    const take = parseInt(req.query.take) || 50;
    try {
        const [models, total] = await Promise.all([
            db_1.default.model.findMany({
                where: { organizationId: orgId, isDeleted: false },
                include: {
                    owner: {
                        select: { id: true, name: true, email: true, avatarUrl: true }
                    },
                    violations: {
                        where: { status: 'open' },
                        select: { id: true, severity: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            db_1.default.model.count({
                where: { organizationId: orgId, isDeleted: false }
            })
        ]);
        res.json({
            success: true,
            data: { models, total, skip, take },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// POST /api/models - Create a new model
router.post('/', (0, validate_1.validate)(schemas_1.createModelSchema), async (req, res) => {
    const orgId = req.orgId;
    const { name, description, type, ownerId, metadata } = req.body;
    try {
        const model = await db_1.default.model.create({
            data: {
                name,
                description: description || null,
                type,
                ownerId,
                organizationId: orgId,
                metadata: metadata ? JSON.stringify(metadata) : '{}',
            },
            include: {
                owner: true
            }
        });
        // Record Audit Log
        await (0, audit_1.recordAuditLog)({
            orgId: orgId,
            userId: req.auth?.sub || ownerId,
            action: 'model_created',
            entityType: 'Model',
            entityId: model.id,
            details: { name: model.name, type: model.type }
        });
        res.status(201).json({
            success: true,
            data: { model },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// GET /api/models/:id - Get single model details
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const orgId = req.orgId;
    try {
        const model = await db_1.default.model.findFirst({
            where: { id, organizationId: orgId },
            include: {
                owner: true,
                organization: true,
                violations: {
                    include: { policy: true }
                },
                policyApplications: {
                    include: { policy: true }
                },
            },
        });
        if (!model || model.isDeleted) {
            return res.status(404).json({ success: false, error: 'Model not found' });
        }
        res.json({
            success: true,
            data: { model },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// DELETE /api/models/:id - Soft delete a model
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const orgId = req.orgId;
    try {
        const model = await db_1.default.model.updateMany({
            where: { id, organizationId: orgId },
            data: { isDeleted: true },
        });
        if (model.count === 0) {
            return res.status(404).json({ success: false, error: 'Model not found' });
        }
        // Record Audit Log
        await (0, audit_1.recordAuditLog)({
            orgId: orgId,
            userId: req.auth?.sub || 'manager',
            action: 'model_deleted',
            entityType: 'Model',
            entityId: id,
            details: { modelId: id }
        });
        res.json({ success: true, message: 'Model archived successfully' });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// PATCH /api/models/:id - Update model details
router.patch('/:id', (0, validate_1.validate)(schemas_1.updateModelSchema), async (req, res) => {
    const { id } = req.params;
    const orgId = req.orgId;
    const { name, description, status, metadata } = req.body;
    try {
        const model = await db_1.default.model.updateMany({
            where: { id, organizationId: orgId },
            data: {
                name,
                description,
                status,
                metadata: metadata ? JSON.stringify(metadata) : undefined
            },
        });
        if (model.count === 0) {
            return res.status(404).json({ success: false, error: 'Model not found' });
        }
        // Record Audit Log
        await (0, audit_1.recordAuditLog)({
            orgId: orgId,
            userId: req.auth?.sub || 'manager',
            action: 'model_updated',
            entityType: 'Model',
            entityId: id,
            details: { status }
        });
        res.json({ success: true, message: 'Model updated successfully' });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
