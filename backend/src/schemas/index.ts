import { z } from 'zod';

// Model Schemas
export const createModelSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  type: z.enum(['fine-tuned', 'proprietary', 'external']),
  ownerId: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updateModelSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Policy Schemas
export const createPolicySchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  scope: z.string().default('all_production'),
  rules: z.array(z.any()).optional(),
  createdById: z.string(),
});

// Budget Schemas
export const createBudgetSchema = z.object({
  name: z.string().min(3).max(100),
  department: z.string(),
  monthlyLimit: z.number().positive(),
  alertThreshold: z.number().min(0).max(1).default(0.8),
});

export const updateBudgetSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  monthlyLimit: z.number().positive().optional(),
  alertThreshold: z.number().min(0).max(1).optional(),
  isActive: z.boolean().optional(),
});

// RAG Resource Schemas
export const createRagResourceSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  type: z.enum(['file', 'url', 'database', 'api']),
  contentUrl: z.string().url().optional(),
  userId: z.string().optional(),
  isGeneral: z.boolean().default(false),
});

// Violation Schema (for updates)
export const updateViolationSchema = z.object({
  status: z.enum(['open', 'investigating', 'remediated', 'ignored']),
  remediation: z.string().optional(),
});

// Agent Schemas
export const createAgentSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  definition: z.record(z.string(), z.any()).optional(),
  category: z.string().optional().default('General'),
  icon: z.string().optional().default('bot'),
});

// Tool Schemas
export const createToolSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.enum(['api', 'script', 'database', 'web']),
  config: z.record(z.string(), z.any()).optional(),
});

// Workflow Schemas
export const createWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  trigger: z.enum(['model_deployment', 'violation_detected', 'schedule']),
  definition: z.array(z.any()).optional(),
});
