"use client";
import React, { useEffect, useState } from 'react';
import { Card, Btn, Themes, Icon, StatusPill } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';
import { useAuth, useOrganization, useUser } from '@clerk/nextjs';
import { apiFetch } from '@/lib/api';

export default function PoliciesPage() {
  const t = Themes.navy;
  const { user } = useUser();
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (organization) {
      fetchPolicies();
    }
  }, [organization]);

  const fetchPolicies = async () => {
    if (!organization) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const json = await apiFetch('/api/policies', {}, token || undefined, organization.id);
      if (json.success) setPolicies(json.data.policies);
      else setError(json.error || 'Failed to load policies');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSamplePolicy = async () => {
    if (!organization) return;
    setSaving(true);
    try {
      const token = await getToken();
      await apiFetch('/api/policies', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Block Competition Mentions',
          description: 'Detect and flag mentions of rival products in customer-facing bots.',
          scope: 'all_production',
          rules: [
            { type: 'keyword', match: ['competitor_x', 'rival_y'], action: 'flag' }
          ],
          createdById: user?.id,
          organizationId: organization.id
        }),
      }, token || undefined, organization.id);
      fetchPolicies();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell persona="manager">
      <PageHeader t={t} title="Governance Policies" subtitle="Configure and enforce organization-wide AI safety rules"
        actions={<Btn t={t} kind="primary" icon="plus" onClick={createSamplePolicy} disabled={saving}>Create Policy</Btn>} />
      
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {loading && <div style={{ color: t.textMuted }}>Loading policies...</div>}
          {error && <div style={{ color: t.danger, gridColumn: 'span 2' }}>Error: {error}</div>}
          
          {!loading && !error && policies.map(p => (
            <Card key={p.id} t={t} title={p.name} subtitle={p.scope.replace('_', ' ')}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>{p.description}</p>
                
                <div style={{ padding: '10px 12px', background: t.surfaceAlt, borderRadius: 8, border: `1px solid ${t.border}` }}>
                   <div style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: 'uppercase', marginBottom: 6 }}>Active Rules</div>
                   {JSON.parse(p.rules || '[]').map((r: any, ri: number) => (
                     <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                        <div style={{ color: t.accent }}><Icon name="zap" size={12} /></div>
                        <div>Scan for <span style={{ fontWeight: 600 }}>{r.type}</span> patterns</div>
                     </div>
                   ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: t.textFaint }}>Last updated {new Date(p.updatedAt).toLocaleDateString()}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                     <Btn t={t} kind="secondary" icon="gear" style={{ padding: '4px 8px' }} />
                     <StatusPill t={t} kind="ok" label="Active" />
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {!loading && policies.length === 0 && (
            <div style={{ gridColumn: 'span 2', padding: 40, textAlign: 'center', background: t.surfaceAlt, borderRadius: 12, border: `1px dashed ${t.border}` }}>
               <Icon name="shield" size={48} style={{ color: t.textFaint, marginBottom: 16, opacity: 0.3 }} />
               <div style={{ fontSize: 16, fontWeight: 600, color: t.text }}>No Policies Found</div>
               <div style={{ fontSize: 14, color: t.textMuted }}>Create your first security policy to start monitoring AI usage.</div>
            </div>
          )}
        </div>
      </PageBody>
    </DashboardShell>
  );
}
