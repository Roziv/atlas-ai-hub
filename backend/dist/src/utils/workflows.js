"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerWorkflows = triggerWorkflows;
const db_1 = __importDefault(require("../db"));
/**
 * Execute all active workflows triggered by a specific event.
 */
async function triggerWorkflows(event, context) {
    try {
        const workflows = await db_1.default.workflow.findMany({
            where: {
                trigger: event,
                isActive: true,
                organizationId: context.orgId
            }
        });
        for (const workflow of workflows) {
            console.log(`[WORKFLOW] Executing: ${workflow.name} for event: ${event}`);
            const definition = JSON.parse(workflow.definition || '{}');
            const actions = definition.actions || [];
            for (const action of actions) {
                await executeAction(action, context);
            }
            // Record the run
            await db_1.default.workflowRun.create({
                data: {
                    workflowId: workflow.id,
                    status: 'success',
                    logs: JSON.stringify({ event, context, executedAt: new Date() })
                }
            });
        }
    }
    catch (err) {
        console.error("Workflow execution failed:", err);
    }
}
async function executeAction(action, context) {
    switch (action.type) {
        case 'slack':
            console.log(`[SLACK NOTIFICATION] Sending to channel: ${action.channel}`);
            console.log(` > Message: ${action.message || 'Security Alert Detected!'}`);
            break;
        case 'email':
            console.log(`[EMAIL ALERT] Sending to: ${action.to}`);
            console.log(` > Subject: ${action.subject || 'Atlas AI Governance Alert'}`);
            break;
        case 'webhook':
            console.log(`[WEBHOOK] Triggering URL: ${action.url}`);
            break;
        default:
            console.warn(`Unknown action type: ${action.type}`);
    }
}
