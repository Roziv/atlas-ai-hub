"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const backend_1 = require("@clerk/backend");
const router = (0, express_1.Router)();
const clerkClient = (0, backend_1.createClerkClient)({ secretKey: process.env.CLERK_SECRET_KEY });
// INVITE user
router.post('/invite', async (req, res) => {
    const orgId = req.orgId;
    try {
        const { email, role, department } = req.body;
        const invitation = await clerkClient.invitations.createInvitation({
            emailAddress: email,
            publicMetadata: { role, department, organizationId: orgId },
            redirectUrl: 'http://localhost:3000/dashboard'
        });
        res.json({ success: true, data: invitation });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// GET all users
router.get('/', async (req, res) => {
    const orgId = req.orgId;
    try {
        // Note: In a production app, we would use clerkClient.organizations.getOrganizationMembershipList({ organizationId: orgId })
        // for a more robust multi-tenant check. For now, we'll list all and filter or use the org-specific list if available.
        const userList = await clerkClient.users.getUserList();
        // Simple filter for the demo: only users who have this orgId in their metadata
        // In real production, we'd use the Organization Membership API.
        const filteredUsers = userList.data.filter((u) => u.publicMetadata?.organizationId === orgId ||
            u.organizationMemberships?.some((m) => m.organization?.id === orgId));
        const formatted = filteredUsers.map(u => ({
            id: u.id,
            email: u.emailAddresses[0]?.emailAddress,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown User',
            role: u.publicMetadata.role || 'end_user',
            department: u.publicMetadata.department || 'General',
            lastActive: u.lastSignInAt ? new Date(u.lastSignInAt).toISOString() : 'Never',
            avatar: u.imageUrl
        }));
        res.json({ success: true, data: formatted });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// UPDATE user metadata (role & department)
router.post('/:id/metadata', async (req, res) => {
    const orgId = req.orgId;
    try {
        const { id } = req.params;
        const { role, department } = req.body;
        const user = await clerkClient.users.getUser(id);
        const userOrgId = user.publicMetadata.organizationId;
        if (userOrgId && userOrgId !== orgId) {
            return res.status(403).json({ success: false, error: 'Access denied: User belongs to another organization' });
        }
        const currentMetadata = user.publicMetadata;
        await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: {
                ...currentMetadata,
                ...(role && { role }),
                ...(department && { department })
            }
        });
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// DELETE user
router.delete('/:id', async (req, res) => {
    const orgId = req.orgId;
    try {
        const { id } = req.params;
        const user = await clerkClient.users.getUser(id);
        const userOrgId = user.publicMetadata.organizationId;
        if (userOrgId && userOrgId !== orgId) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        await clerkClient.users.deleteUser(id);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
