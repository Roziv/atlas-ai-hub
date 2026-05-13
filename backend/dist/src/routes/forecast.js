"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
const express_1 = require("express");
const router = (0, express_1.Router)();
// GET /api/forecast - Real-ish linear forecasting data based on last 30 days
router.get('/', async (req, res) => {
    const orgId = req.orgId;
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        // Fetch last 30 days of spend
        const spend = await db_1.default.spendRecord.aggregate({
            where: { organizationId: orgId, recordDate: { gte: thirtyDaysAgo } },
            _sum: { amount: true }
        });
        const mtdTotal = spend._sum.amount || 0;
        const dailyAvg = mtdTotal / 30;
        const annualBase = dailyAvg * 365;
        const formatCurrency = (val) => {
            if (val >= 1000000)
                return `$${(val / 1000000).toFixed(1)}M`;
            if (val >= 1000)
                return `$${(val / 1000).toFixed(1)}K`;
            return `$${val.toFixed(0)}`;
        };
        const scenarios = [
            { name: 'Conservative', total: formatCurrency(annualBase * 0.85), delta: '-15%', kind: 'ok', desc: 'Current trajectory + 15% optimization target' },
            { name: 'Base', total: formatCurrency(annualBase), delta: '0%', kind: 'ok', desc: 'Linear extrapolation of last 30 days spend', selected: true },
            { name: 'Aggressive', total: formatCurrency(annualBase * 1.5), delta: '+50%', kind: 'warn', desc: 'Planned expansion into all business units by Q4' },
        ];
        res.json({ success: true, data: scenarios });
    }
    catch (e) {
        res.status(500).json({ success: false, error: 'Failed to calculate forecast data' });
    }
});
exports.default = router;
