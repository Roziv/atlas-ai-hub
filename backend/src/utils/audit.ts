import prisma from '../db';

/**
 * Record an administrative or system action for compliance.
 */
export async function recordAuditLog(data: {
    orgId: string,
    userId: string,
    action: string,
    entityType: 'Model' | 'Policy' | 'Violation' | 'RagResource' | 'Budget' | 'System' | 'Workflow' | 'Agent' | 'Tool',
    entityId?: string,
    details?: any
}) {
    try {
        console.log(`[AUDIT] ${data.action} by ${data.userId} on ${data.entityType} (${data.entityId || 'N/A'})`);
        
        // Note: Our schema has specific relation fields for Model, Policy, RagResource
        const logData: any = {
            organizationId: data.orgId,
            userId: data.userId,
            action: data.action,
            entityType: data.entityType,
            entityId: data.entityId,
            details: typeof data.details === 'object' ? JSON.stringify(data.details) : (data.details || '{}'),
        };

        // Link specific relations if they match
        if (data.entityType === 'Model') logData.modelId = data.entityId;
        if (data.entityType === 'Policy') logData.policyId = data.entityId;
        if (data.entityType === 'RagResource') logData.ragResourceId = data.entityId;

        await prisma.auditLog.create({
            data: logData
        });
    } catch (err) {
        console.error("Failed to record audit log:", err);
    }
}
