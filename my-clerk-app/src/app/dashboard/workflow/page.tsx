"use client";
import React, { useEffect, useState } from 'react';
import { Card, Btn, Themes, StatusPill, Icon } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { apiFetch } from '@/lib/api';

export default function WorkflowPage() {
  const t = Themes.navy;
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlows = async () => {
    if (!organization) return;
    
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const json = await apiFetch('/api/workflows', {}, token || undefined, organization.id);
      if (json.success) {
        setFlows(json.data);
      } else {
        throw new Error(json.error || 'Failed to fetch workflows');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlows();
  }, [organization, getToken]);

  return (
    <DashboardShell persona="manager">
      <PageHeader t={t} title="Automated Workflows" subtitle="Rule-based actions and approval pipelines across your AI estate."
        actions={<Btn t={t} icon="plus">New flow</Btn>} />
      <PageBody t={t}>
        {error && (
          <div style={{ padding: 20, background: t.dangerSoft, color: t.dangerText, borderRadius: 12, marginBottom: 20, border: `1px solid ${t.danger}` }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Workflow Service Error</div>
            <div style={{ fontSize: 13 }}>{error}</div>
            <button 
              onClick={() => fetchFlows()}
              style={{ marginTop: 12, padding: '6px 12px', background: t.danger, color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
            >
              Retry Connection
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {loading ? (
            <div style={{ padding: 20, color: t.textMuted }}>Loading workflows...</div>
          ) : flows.length > 0 ? (
            flows.map((f, i) => {
              const steps = JSON.parse(f.definition || '[]');
              return (
                <Card key={f.id} t={t} title={f.name} subtitle={f.description} 
                  action={<StatusPill t={t} kind={f.status === 'active' ? 'ok' : 'off'} label={f.status} />}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 20 }}>
                      <FlowStat t={t} label="Trigger" value={f.trigger.replace(/_/g, ' ')} />
                      <FlowStat t={t} label="Steps" value={steps.length} />
                      <FlowStat t={t} label="Runs" value={f._count?.runs || 0} />
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 0' }}>
                      {steps.map((step: any, idx: number) => (
                        <div key={idx} style={{ 
                          display: 'flex', alignItems: 'center', gap: 4, 
                          padding: '3px 8px', background: t.surfaceAlt, border: `1px solid ${t.border}`, 
                          borderRadius: 6, fontSize: 11, color: t.text
                        }}>
                          <span style={{ fontWeight: 700, color: t.accent }}>{idx + 1}</span>
                          <span style={{ textTransform: 'capitalize' }}>{step.type}</span>
                        </div>
                      ))}
                    </div>
  
                    <div style={{ padding: 12, background: t.surfaceAlt, borderRadius: t.radiusMd, border: `1px solid ${t.border}` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: t.textFaint, textTransform: 'uppercase', marginBottom: 8 }}>Last activity</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="chart" size={13} style={{ color: t.accent }} />
                        <span style={{ fontSize: 13, color: t.text }}>{f.lastRunAt ? new Date(f.lastRunAt).toLocaleString() : 'No recent activity'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <Btn t={t} kind="secondary" size="sm" icon="edit">Edit flow</Btn>
                      <Btn t={t} kind="secondary" size="sm" icon="chart">View logs</Btn>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : !error && <div style={{ color: t.textMuted }}>No workflows found for this organization.</div>}
        </div>
      </PageBody>
    </DashboardShell>
  );
}

const FlowStat = ({ t, label, value }: any) => (
  <div>
    <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, color: t.text, marginTop: 2 }}>{value}</div>
  </div>
);
