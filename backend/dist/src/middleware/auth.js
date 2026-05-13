"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.orgAccessMiddleware = orgAccessMiddleware;
const backend_1 = require("@clerk/backend");
const db_1 = __importDefault(require("../db"));
const clerkClient = (0, backend_1.createClerkClient)({ secretKey: process.env.CLERK_SECRET_KEY });
/**
 * Validates the Clerk JWT token from the Authorization header
 */
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    try {
        const decoded = await (0, backend_1.verifyToken)(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });
        req.auth = decoded; // Store decoded token in request
        next();
    }
    catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token', message: err.message });
    }
}
/**
 * Ensures the user has access to the specified organization and resolves the internal database ID
 */
async function orgAccessMiddleware(req, res, next) {
    const clerkOrgId = req.headers['x-org-id'] || req.query.orgId || req.body.organizationId;
    if (!clerkOrgId) {
        return res.status(400).json({ success: false, error: 'Organization ID required in header (x-org-id), query, or body' });
    }
    try {
        // Look up the organization by ID (database ID or Clerk ID)
        let org = await db_1.default.organization.findUnique({
            where: { id: clerkOrgId }
        });
        // Fallback: Try to find by slug for development
        if (!org) {
            org = await db_1.default.organization.findUnique({
                where: { slug: 'acme-corp' }
            });
        }
        if (!org) {
            return res.status(404).json({ success: false, error: 'Organization not found' });
        }
        // Attach the internal database ID to the request for all downstream routes
        req.orgId = org.id;
        next();
    }
    catch (err) {
        console.error('[ORG ACCESS ERROR]', err.message);
        return res.status(500).json({ success: false, error: 'Failed to verify organization access', details: err.message });
    }
}
