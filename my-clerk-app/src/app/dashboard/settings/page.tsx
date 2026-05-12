"use client";
import React, { useState } from 'react';
import { Card, Btn, Themes, Icon } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';
import { updateUserRole } from '@/lib/actions';
import { useUser } from '@clerk/nextjs';

export default function SettingsPage() {
  const t = Themes.navy;
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);

  const currentRole = (user?.publicMetadata?.role as string) || 'end_user';

  const handleRoleChange = async (newRole: string) => {
    setLoading(true);
    try {
      const res = await updateUserRole(newRole);
      if (res?.success) {
        window.location.reload(); 
      } else {
        alert(`Failed to update role: ${res?.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`System Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <DashboardShell persona="workspace">
      <PageHeader t={t} title="Account Settings" subtitle="Manage your profile and permissions" />
      <PageBody t={t}>
        <div style={{ maxWidth: 600 }}>
          <Card t={t} title="Enterprise Role" subtitle="For this demo, you can simulate different organizational roles.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              {[
                { id: 'ai_manager', label: 'AI Manager', desc: 'Full access to Governance, Registry, and Analytics' },
                { id: 'cfo',        label: 'CFO',        desc: 'Access to Finance, Spend, and ROI tools' },
                { id: 'end_user',   label: 'Employee',   desc: 'Access to Tool Gallery and Workspace builder' },
              ].map(r => (
                <div key={r.id} 
                  onClick={() => !loading && handleRoleChange(r.id)}
                  style={{
                    padding: 16, borderRadius: 12, border: `1px solid ${currentRole === r.id ? t.accent : t.border}`,
                    background: currentRole === r.id ? t.accentSoft : t.surface,
                    cursor: loading ? 'wait' : 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 16
                  }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: 10, background: currentRole === r.id ? t.accent : t.surfaceAlt,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentRole === r.id ? '#fff' : t.textMuted
                  }}>
                    <Icon name={r.id === 'ai_manager' ? 'shield' : r.id === 'cfo' ? 'coin' : 'flow'} size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: t.textMuted }}>{r.desc}</div>
                  </div>
                  {currentRole === r.id && <Icon name="check" size={18} style={{ color: t.accent }} />}
                </div>
              ))}
            </div>
            {loading && <div style={{ marginTop: 12, fontSize: 12, color: t.accent, fontWeight: 600 }}>Updating permissions...</div>}
          </Card>
        </div>
      </PageBody>
    </DashboardShell>
  );
}
