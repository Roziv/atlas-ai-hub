"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkflowSchema = exports.createToolSchema = exports.createAgentSchema = exports.updateViolationSchema = exports.createRagResourceSchema = exports.updateBudgetSchema = exports.createBudgetSchema = exports.createPolicySchema = exports.updateModelSchema = exports.createModelSchema = void 0;
const zod_1 = require("zod");
// Model Schemas
exports.createModelSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(100),
    description: zod_1.z.string().optional(),
    type: zod_1.z.enum(['fine-tuned', 'proprietary', 'external']),
    ownerId: zod_1.z.string(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
exports.updateModelSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(100).optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
// Policy Schemas
exports.createPolicySchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(100),
    description: zod_1.z.string().optional(),
    scope: zod_1.z.string().default('all_production'),
    rules: zod_1.z.array(zod_1.z.any()).optional(),
    createdById: zod_1.z.string(),
});
// Budget Schemas
exports.createBudgetSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(100),
    department: zod_1.z.string(),
    monthlyLimit: zod_1.z.number().positive(),
    alertThreshold: zod_1.z.number().min(0).max(1).default(0.8),
});
exports.updateBudgetSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(100).optional(),
    monthlyLimit: zod_1.z.number().positive().optional(),
    alertThreshold: zod_1.z.number().min(0).max(1).optional(),
    isActive: zod_1.z.boolean().optional(),
});
// RAG Resource Schemas
exports.createRagResourceSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(100),
    description: zod_1.z.string().optional(),
    type: zod_1.z.enum(['file', 'url', 'database', 'api']),
    contentUrl: zod_1.z.string().url().optional(),
    userId: zod_1.z.string().optional(),
    isGeneral: zod_1.z.boolean().default(false),
});
// Violation Schema (for updates)
exports.updateViolationSchema = zod_1.z.object({
    status: zod_1.z.enum(['open', 'investigating', 'remediated', 'ignored']),
    remediation: zod_1.z.string().optional(),
});
// Agent Schemas
exports.createAgentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    definition: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    category: zod_1.z.string().optional().default('General'),
    icon: zod_1.z.string().optional().default('bot'),
});
// Tool Schemas
exports.createToolSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    type: zod_1.z.enum(['api', 'script', 'database', 'web']),
    config: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
// Workflow Schemas
exports.createWorkflowSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    trigger: zod_1.z.enum(['model_deployment', 'violation_detected', 'schedule']),
    definition: zod_1.z.array(zod_1.z.any()).optional(),
});
