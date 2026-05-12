"use client";
import React, { useEffect, useState } from 'react';
import { Card, Icon, Btn, Themes, StatusPill } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { apiFetch } from '@/lib/api';
import { useEnterpriseStore } from '@/store/useEnterpriseStore';

export default function ModelRegistryPage() {
  const t = Themes.navy;
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const { aiSettings, loading: storeLoading, fetchEnterpriseData } = useEnterpriseStore();
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!organization) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      await fetchEnterpriseData(token || undefined, organization.id);
      
      const json = await apiFetch('/api/models', {}, token || undefined, organization.id);
      if (json.success) {
        setModels(json.data.models);
      } else {
        setError(json.error || 'Failed to load models');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organization) {
      loadData();
    }
  }, [organization]);

  return (
    <DashboardShell persona="manager">
      <PageHeader t={t} title="Model registry" subtitle={`${models.length} models · centralized catalog`}
        actions={<>
          <Btn t={t} kind="secondary" icon="filter">Filter</Btn>
          <Btn t={t} icon="plus">Register model</Btn>
        </>} />
      <PageBody t={t}>
        <Card t={t} padding={0}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.2fr 1.2fr 1fr 1fr 1fr 0.6fr',
            padding: '10px 16px', fontSize: 11, fontWeight: 600, color: t.textFaint,
            textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `1px solid ${t.border}`,
          }}>
            <div>Model</div><div>Team</div><div>Base</div><div>Stage</div><div>Status</div><div>Cost</div><div></div>
          </div>
          {loading && <div style={{ padding: 20, textAlign: 'center', color: t.textMuted }}>Loading models from database...</div>}
          {error && <div style={{ padding: 20, textAlign: 'center', color: t.danger }}>Error: {error}</div>}
          {!loading && !error && models.map((m, i) => {
            const meta = typeof m.metadata === 'string' ? JSON.parse(m.metadata || '{}') : (m.metadata || {});
            return (
              <div key={m.id} style={{
                display: 'grid', gridTemplateColumns: '2.4fr 1.2fr 1.2fr 1fr 1fr 1fr 0.6fr',
                padding: '12px 16px', borderTop: i > 0 ? `1px solid ${t.border}` : 'none',
                alignItems: 'center', fontSize: 13, color: t.text,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Icon name="cpu" size={14} style={{ color: t.textFaint }} />
                  <div>
                    <div style={{ fontWeight: 600, fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: t.textFaint }}>v{meta.version || '1.0.0'} · {meta.users || 0} users</div>
                  </div>
                </div>
                <div style={{ color: t.textMuted }}>{meta.team || 'Global'}</div>
                <div style={{ color: t.textMuted, fontFamily: 'ui-monospace, monospace', fontSize: 12, textTransform: 'capitalize' }}>{m.type}</div>
                <div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 4,
                    background: t.accentSoft,
                    color: t.accentText,
                    textTransform: 'uppercase', letterSpacing: 0.4,
                  }}>Production</span>
                </div>
                <div><StatusPill t={t} kind={m.violations?.length > 0 ? 'warn' : 'ok'} /></div>
                <div style={{ color: t.textMuted, fontSize: 12.5 }}>{meta.cost || 'TBD'}</div>
                <div style={{ textAlign: 'right' }}><Icon name="more" size={14} style={{ color: t.textFaint }} /></div>
              </div>
            );
          })}
        </Card>
      </PageBody>
    </DashboardShell>
  );
}
