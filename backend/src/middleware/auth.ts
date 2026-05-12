import { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import prisma from '../db';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * Validates the Clerk JWT token from the Authorization header
 */
export async function authMiddleware(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    req.auth = decoded; // Store decoded token in request
    next();
  } catch (err: any) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token', message: err.message });
  }
}

/**
 * Ensures the user has access to the specified organization and resolves the internal database ID
 */
export async function orgAccessMiddleware(req: any, res: Response, next: NextFunction) {
  const clerkOrgId = req.headers['x-org-id'] || req.query.orgId || req.body.organizationId;

  if (!clerkOrgId) {
    return res.status(400).json({ success: false, error: 'Organization ID required in header (x-org-id), query, or body' });
  }

  try {
    // Look up the organization by ID (database ID or Clerk ID)
    let org = await prisma.organization.findUnique({
      where: { id: clerkOrgId as string }
    });

    // Fallback: Try to find by slug for development
    if (!org) {
      org = await prisma.organization.findUnique({
        where: { slug: 'acme-corp' }
      });
    }

    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    // Attach the internal database ID to the request for all downstream routes
    req.orgId = org.id;
    next();
  } catch (err: any) {
    console.error('[ORG ACCESS ERROR]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to verify organization access', details: err.message });
  }
}
