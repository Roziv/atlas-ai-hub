"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordAuditLog = recordAuditLog;
const db_1 = __importDefault(require("../db"));
/**
 * Record an administrative or system action for compliance.
 */
async function recordAuditLog(data) {
    try {
        console.log(`[AUDIT] ${data.action} by ${data.userId} on ${data.entityType} (${data.entityId || 'N/A'})`);
        // Note: Our schema has specific relation fields for Model, Policy, RagResource
        const logData = {
            organizationId: data.orgId,
            userId: data.userId,
            action: data.action,
            entityType: data.entityType,
            entityId: data.entityId,
            details: typeof data.details === 'object' ? JSON.stringify(data.details) : (data.details || '{}'),
        };
        // Link specific relations if they match
        if (data.entityType === 'Model')
            logData.modelId = data.entityId;
        if (data.entityType === 'Policy')
            logData.policyId = data.entityId;
        if (data.entityType === 'RagResource')
            logData.ragResourceId = data.entityId;
        await db_1.default.auditLog.create({
            data: logData
        });
    }
    catch (err) {
        console.error("Failed to record audit log:", err);
    }
}
