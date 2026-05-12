"use client";
import React, { useState, useEffect } from 'react';
import { Card, Btn, Themes, Icon, StatusPill, Avatar } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';

import { useAuth, useOrganization } from '@clerk/nextjs';
import { apiFetch } from '@/lib/api';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'Product', 'Legal', 'Support', 'Finance', 'HR', 'Operations'];

export default function UserManagementPage() {
  const t = Themes.navy;
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('end_user');
  const [inviteDept, setInviteDept] = useState('Engineering');
  const [inviting, setInviting] = useState(false);

  const fetchUsers = async () => {
    if (!organization) return;
    setLoading(true);
    try {
      const token = await getToken();
      const json = await apiFetch('/api/users', {}, token || undefined, organization.id);
      if (json.success) setUsers(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organization) {
      fetchUsers();
    }
  }, [organization, getToken]);

  const handleInvite = async () => {
    if (!inviteEmail || !organization) return;
    setInviting(true);
    try {
      const token = await getToken();
      const json = await apiFetch('/api/users/invite', {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, department: inviteDept }),
      }, token || undefined, organization.id);

      if (json.success) {
        alert(`Invitation sent to ${inviteEmail} in ${inviteDept}!`);
        setInviteEmail('');
      } else {
        alert('Error: ' + json.error);
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to send invitation.');
    } finally {
      setInviting(false);
    }
  };

  const updateMetadata = async (userId: string, data: any) => {
    if (!organization) return;
    try {
      const token = await getToken();
      await apiFetch(`/api/users/${userId}/metadata`, {
        method: 'POST',
        body: JSON.stringify(data),
      }, token || undefined, organization.id);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user?') || !organization) return;
    try {
      const token = await getToken();
      await apiFetch(`/api/users/${userId}`, { method: 'DELETE' }, token || undefined, organization.id);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardShell persona="manager">
      <PageHeader t={t} title="User Management" subtitle="Manage enterprise access, roles, and department attribution" />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, marginBottom: 24 }}>
          <Card t={t} title="Onboard New Employee" subtitle="Send an invite with role and department pre-set">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
              <input 
                type="email" 
                placeholder="employee@acme.corp" 
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                style={{ flex: 2, minWidth: 200, padding: '10px 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, outline: 'none' }}
              />
              <select 
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                style={{ flex: 1, padding: '0 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, outline: 'none' }}
              >
                <option value="end_user">Employee</option>
                <option value="ai_manager">Manager</option>
                <option value="cfo">CFO</option>
              </select>
              <select 
                value={inviteDept}
                onChange={e => setInviteDept(e.target.value)}
                style={{ flex: 1, padding: '0 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, outline: 'none' }}
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <Btn t={t} kind="primary" onClick={handleInvite} disabled={inviting}>
                {inviting ? '...' : 'Invite'}
              </Btn>
            </div>
          </Card>
          
          <Card t={t} title="Platform Sync" subtitle="Keep Atlas in sync with enterprise directory">
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <Btn t={t} kind="secondary" icon="download" onClick={fetchUsers}>Refresh List</Btn>
              <Btn t={t} kind="secondary" icon="grid">Export CSV</Btn>
            </div>
          </Card>
        </div>

        <Card t={t} padding={0}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1.2fr 1fr 1fr 0.6fr',
            padding: '12px 16px', fontSize: 11, fontWeight: 700, color: t.textFaint,
            textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `1px solid ${t.border}`,
          }}>
            <div>User / Email</div><div>Role</div><div>Department</div><div>Last Active</div><div>Status</div><div></div>
          </div>
          
          {loading && <div style={{ padding: 40, textAlign: 'center', color: t.textMuted }}>Syncing with Clerk...</div>}
          
          {!loading && users.map((user, i) => (
            <div key={user.id} style={{
              display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1.2fr 1fr 1fr 0.6fr',
              padding: '14px 16px', borderTop: i > 0 ? `1px solid ${t.border}` : 'none',
              alignItems: 'center', fontSize: 13, color: t.text,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar src={user.avatar} name={user.name} size={32} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: t.textFaint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                </div>
              </div>
              
              <div>
                <select 
                  value={user.role} 
                  onChange={(e) => updateMetadata(user.id, { role: e.target.value })}
                  style={{ width: '100%', padding: '4px 8px', borderRadius: 6, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, fontSize: 12, outline: 'none' }}>
                  <option value="end_user">Employee</option>
                  <option value="ai_manager">AI Manager</option>
                  <option value="cfo">CFO</option>
                </select>
              </div>

              <div>
                <select 
                  value={user.department} 
                  onChange={(e) => updateMetadata(user.id, { department: e.target.value })}
                  style={{ width: '100%', padding: '4px 8px', borderRadius: 6, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, fontSize: 12, outline: 'none' }}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ color: t.textMuted, fontSize: 12 }}>
                {user.lastActive !== 'Never' ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
              </div>

              <div><StatusPill t={t} kind="ok" label="Active" /></div>

              <div style={{ textAlign: 'right' }}>
                <button onClick={() => deleteUser(user.id)} style={{ border: 'none', background: 'none', color: t.danger, cursor: 'pointer', padding: 4 }}>
                   <Icon name="lock" size={14} />
                </button>
              </div>
            </div>
          ))}
        </Card>
      </PageBody>
    </DashboardShell>
  );
}
