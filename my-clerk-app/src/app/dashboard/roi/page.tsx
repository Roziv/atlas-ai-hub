"use client";
import React, { useEffect, useState } from 'react';
import { Card, Stat, Themes, StatusPill } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { apiFetch } from '@/lib/api';

export default function RoiDashboardPage() {
  const t = Themes.navy;
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!organization) return;
      
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const json = await apiFetch('/api/roi', {}, token || undefined, organization.id);
        if (json.success) {
          setData(json.data);
        } else {
          throw new Error(json.error || 'Failed to fetch ROI data');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [organization, getToken]);

  return (
    <DashboardShell persona="finance">
      <PageHeader t={t} title="ROI Dashboard" subtitle="Value attribution and savings across AI tools" />
      <PageBody t={t}>
        {error && (
          <div style={{ padding: 20, background: t.dangerSoft, color: t.dangerText, borderRadius: 12, marginBottom: 20, border: `1px solid ${t.danger}` }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Connection Error</div>
            <div style={{ fontSize: 13 }}>{error}</div>
            <button 
              onClick={() => window.location.reload()}
              style={{ marginTop: 12, padding: '6px 12px', background: t.danger, color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
            >
              Retry Connection
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {loading ? <div style={{ color: t.textMuted }}>Loading ROI data...</div> : (
            data.length > 0 ? (
              data.map((item, idx) => (
                <Card key={idx} t={t} title={item.name} subtitle={item.team} padding={16}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, letterSpacing: 0.5 }}>INVESTED</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>${item.invested.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, letterSpacing: 0.5 }}>EST. VALUE</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: t.successText }}>${item.value.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, letterSpacing: 0.5 }}>USAGE</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{item.usage} runs</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: `1px dashed ${t.border}` }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, letterSpacing: 0.5 }}>RETURN</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: t.accent }}>{item.roi}</span>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <StatusPill t={t} kind={item.status} label={item.status === 'ok' ? 'Efficient' : 'Underperforming'} />
                    </div>
                  </div>
                </Card>
              ))
            ) : !error && <div style={{ color: t.textMuted }}>No ROI data available for this organization.</div>
          )}
        </div>
      </PageBody>
    </DashboardShell>
  );
}
