"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// GET /api/reports - placeholder scheduled reports data
router.get('/', async (req, res) => {
    try {
        const data = [
            { id: 1, name: 'Monthly Spend Summary', schedule: 'Monthly', nextRun: '2024-06-01' },
            { id: 2, name: 'Quarterly ROI Analysis', schedule: 'Quarterly', nextRun: '2024-07-15' },
            { id: 3, name: 'Budget Alert Digest', schedule: 'Weekly', nextRun: '2024-05-20' },
        ];
        res.json({ success: true, data });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Failed to fetch reports' });
    }
});
exports.default = router;
