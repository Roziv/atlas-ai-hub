"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const router = express_1.default.Router();
// GET /api/audit - List recent audit logs
router.get('/', async (req, res) => {
    const orgId = req.orgId;
    const skip = parseInt(req.query.skip) || 0;
    const take = parseInt(req.query.take) || 50;
    try {
        const [logs, total] = await Promise.all([
            db_1.default.auditLog.findMany({
                where: { organizationId: orgId },
                skip,
                take,
                include: {
                    user: {
                        select: { name: true, avatarUrl: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
            }),
            db_1.default.auditLog.count({
                where: { organizationId: orgId }
            })
        ]);
        res.json({
            success: true,
            data: { logs, total, skip, take },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
