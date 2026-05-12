"use client";
import React, { useState, useEffect } from 'react';
import { Card, Btn, Themes, Icon } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';
import { useAuth, useOrganization, useUser } from '@clerk/nextjs';
import { apiFetch } from '@/lib/api';

export default function GeneralKnowledgePage() {
  const t = Themes.navy;
  const { user } = useUser();
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    if (!organization) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      // Fetch only general knowledge (company-wide)
      const json = await apiFetch('/api/rag?isGeneral=true', {}, token || undefined, organization.id);
      if (json.success) setResources(json.data.resources);
      else setError(json.error || 'Failed to load general knowledge');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organization) {
      fetchResources();
    }
  }, [organization, getToken]);

  return (
    <DashboardShell persona="manager">
      <PageHeader t={t} title="Knowledge Library" subtitle="Organization-wide document repositories and general knowledge bases."
        actions={<Btn t={t} icon="plus">Add Shared Resource</Btn>} />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {loading && <div style={{ color: t.textMuted, padding: 20 }}>Syncing enterprise library...</div>}
          {error && <div style={{ color: t.danger, padding: 20, gridColumn: 'span 3' }}>Error: {error}</div>}
          
          {!loading && !error && resources.map(res => (
            <Card key={res.id} t={t} title={res.name} subtitle={`${res.type} · v${res.version}`} 
              actions={<div style={{ padding: '2px 6px', background: t.accentSoft, color: t.accent, borderRadius: 4, fontSize: 10, fontWeight: 700 }}>SHARED</div>}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                <p style={{ fontSize: 12, color: t.textMuted, margin: 0, minHeight: 32 }}>{res.description || 'Enterprise knowledge asset.'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: `1px solid ${t.border}` }}>
                   <div style={{ fontSize: 11, color: t.textFaint }}>Used by {res.distributions?.length || 0} departments</div>
                   <div style={{ display: 'flex', gap: 6 }}>
                      <Btn t={t} kind="ghost" size="sm" icon="settings" />
                   </div>
                </div>
              </div>
            </Card>
          ))}

          {!loading && !error && resources.length === 0 && (
            <div style={{ gridColumn: 'span 3', padding: 60, textAlign: 'center', background: t.surfaceAlt, borderRadius: 12, border: `1px dashed ${t.border}` }}>
               <Icon name="book" size={48} style={{ color: t.textFaint, marginBottom: 16, opacity: 0.3 }} />
               <div style={{ fontSize: 16, fontWeight: 600, color: t.text }}>No General Knowledge Found</div>
               <div style={{ fontSize: 14, color: t.textMuted }}>Upload company-wide documents here to make them available across the organization.</div>
               <Btn t={t} kind="primary" icon="plus" style={{ marginTop: 20 }}>Create First Resource</Btn>
            </div>
          )}
        </div>
      </PageBody>
    </DashboardShell>
  );
}
