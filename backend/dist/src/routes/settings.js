"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// GET global AI settings
router.get('/ai', async (req, res) => {
    try {
        let org = await db_1.default.organization.findUnique({
            where: { id: req.orgId }
        });
        if (!org) {
            org = await db_1.default.organization.findUnique({
                where: { slug: 'acme-corp' }
            });
        }
        if (!org)
            return res.status(404).json({ success: false, error: 'Org not found' });
        const settings = JSON.parse(org.settings || '{}');
        const defaultAi = {
            providers: {
                openai: { apiKey: '' },
                anthropic: { apiKey: '' },
                ollama: { baseUrl: 'http://localhost:11434' },
                ollama_cloud: { baseUrl: 'https://cloud.ollama.ai' }
            },
            modelLibrary: [
                { id: 'm1', name: 'GPT-4o', provider: 'openai', modelId: 'gpt-4o' },
                { id: 'm2', name: 'Claude 3.5 Sonnet', provider: 'anthropic', modelId: 'claude-3-5-sonnet-20240620' }
            ],
            routingRules: [
                { department: 'Engineering', modelId: 'm1' }
            ],
            governance: {
                pii_redaction: true,
                audit_all: true,
                spend_limit: false
            }
        };
        res.json({ success: true, data: settings.ai || defaultAi });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// UPDATE global AI settings
router.post('/ai', async (req, res) => {
    try {
        const { aiSettings } = req.body;
        let org = await db_1.default.organization.findUnique({
            where: { id: req.orgId }
        });
        if (!org) {
            org = await db_1.default.organization.findUnique({
                where: { slug: 'acme-corp' }
            });
        }
        if (!org)
            return res.status(404).json({ success: false, error: 'Org not found' });
        const currentSettings = JSON.parse(org.settings || '{}');
        const updatedSettings = { ...currentSettings, ai: aiSettings };
        await db_1.default.organization.update({
            where: { id: org.id },
            data: { settings: JSON.stringify(updatedSettings) }
        });
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
