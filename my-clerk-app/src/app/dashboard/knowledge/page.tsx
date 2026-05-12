"use client";
import React from 'react';
import { Card, Btn, Themes } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';
import { useAuth, useOrganization, useUser } from '@clerk/nextjs';
import { apiFetch } from '@/lib/api';

export default function MyKnowledgePage() {
  const t = Themes.navy;
  const { user } = useUser();
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [resources, setResources] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user || !organization) return;
    
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        // Fetch only personal knowledge (user-specific)
        const json = await apiFetch(`/api/rag?userId=${user.id}&isGeneral=false`, {}, token || undefined, organization.id);
        if (json.success) setResources(json.data.resources);
        else setError(json.error || 'Failed to load personal knowledge');
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [user, organization, getToken]);

  return (
    <DashboardShell persona="workspace">
      <PageHeader t={t} title="My Knowledge" subtitle="Manage your personal documents and datasets used by your private agents."
        actions={<Btn t={t} icon="plus">Upload PDF/Doc</Btn>} />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {loading && <div style={{ color: t.textMuted }}>Syncing knowledge base...</div>}
          {error && <div style={{ color: t.danger, gridColumn: 'span 3' }}>Error: {error}</div>}
          
          {!loading && !error && resources.map(res => (
            <Card key={res.id} t={t} title={res.name} subtitle={`${res.type} · v${res.version}`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                <p style={{ fontSize: 12, color: t.textMuted, margin: 0 }}>{res.description || 'No description provided.'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: `1px solid ${t.border}` }}>
                   <div style={{ fontSize: 11, color: t.textFaint }}>{res.distributions?.length || 0} active links</div>
                   <Btn t={t} kind="ghost" size="sm" icon="gear" />
                </div>
              </div>
            </Card>
          ))}

          {!loading && resources.length === 0 && (
            <div style={{ gridColumn: 'span 3', padding: 40, textAlign: 'center', background: t.surfaceAlt, borderRadius: 12, border: `1px dashed ${t.border}` }}>
               <div style={{ fontSize: 16, fontWeight: 600, color: t.text }}>The Library is Empty</div>
               <div style={{ fontSize: 14, color: t.textMuted }}>Start by uploading your first document to give your agents context.</div>
            </div>
          )}
        </div>
      </PageBody>
    </DashboardShell>
  );
}
