"use client";
import React, { useState, useEffect } from 'react';
import { Card, Btn, Themes, Icon, StatusPill } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { apiFetch } from '@/lib/api';

export default function FinanceUsagePage() {
  const t = Themes.navy;
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const json = await apiFetch('/api/spend/stats', {}, token || undefined, organization.id);
        if (json.success) setStats(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [organization, getToken]);

  if (loading) return <DashboardShell persona="finance"><div style={{ padding: 100, textAlign: 'center', color: t.textFaint }}>Loading Analytics...</div></DashboardShell>;

  const totalSpend = stats?.totals?.amount || 0;
  const totalTokens = stats?.totals?.tokens || 0;

  return (
    <DashboardShell persona="finance">
      <PageHeader 
        t={t} 
        title="Usage & Analytics" 
        subtitle="Monitor AI consumption and cost-attribution across departments" 
      />
      
      <PageBody t={t}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
             <Card t={t}>
                <div style={{ color: t.textFaint, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>TOTAL SPEND (MTD)</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.text }}>${totalSpend.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: t.success, marginTop: 4 }}>+12% from last month</div>
             </Card>
             <Card t={t}>
                <div style={{ color: t.textFaint, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>TOTAL TOKENS</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.text }}>{(totalTokens / 1000).toFixed(1)}k</div>
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>Across all providers</div>
             </Card>
             <Card t={t}>
                <div style={{ color: t.textFaint, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>ACTIVE DEPARTMENTS</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.text }}>{stats?.byDepartment?.length || 0}</div>
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>Engaged in AI workflows</div>
             </Card>
             <Card t={t}>
                <div style={{ color: t.textFaint, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>COST EFFICIENCY</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.text }}>94%</div>
                <div style={{ fontSize: 11, color: t.success, marginTop: 4 }}>High cache hit rate</div>
             </Card>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
             <Card t={t} title="Departmental Attribution" subtitle="Direct costs incurred per department">
                <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                   {stats?.byDepartment?.map((dept: any) => (
                     <div key={dept.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                           <span style={{ color: t.text }}>{dept.name}</span>
                           <span style={{ color: t.accent }}>${dept.value.toFixed(2)}</span>
                        </div>
                        <div style={{ width: '100%', height: 8, borderRadius: 4, background: t.surfaceSunk, overflow: 'hidden' }}>
                           <div style={{ 
                             width: `${(dept.value / (totalSpend || 1)) * 100}%`, 
                             height: '100%', 
                             background: t.accent,
                             transition: 'width 1s ease-out'
                           }} />
                        </div>
                     </div>
                   ))}
                </div>
             </Card>
             <Card t={t} title="Model Distribution" subtitle="Usage share by LLM version">
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {stats?.byModel?.map((m: any) => (
                     <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: t.surfaceAlt, borderRadius: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 5, background: t.accent }} />
                        <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: t.text }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: t.textMuted }}>{((m.value / (totalSpend || 1)) * 100).toFixed(0)}%</div>
                     </div>
                   ))}
                </div>
             </Card>
          </div>

          <Card t={t} title="Real-time Usage Log" subtitle="Live stream of organization-wide AI calls">
             <div style={{ marginTop: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                      <tr style={{ textAlign: 'left', borderBottom: `1px solid ${t.border}` }}>
                         <th style={{ padding: '12px 8px', fontSize: 11, color: t.textFaint }}>TIMESTAMP</th>
                         <th style={{ padding: '12px 8px', fontSize: 11, color: t.textFaint }}>DEPARTMENT</th>
                         <th style={{ padding: '12px 8px', fontSize: 11, color: t.textFaint }}>PROVIDER</th>
                         <th style={{ padding: '12px 8px', fontSize: 11, color: t.textFaint }}>MODEL</th>
                         <th style={{ padding: '12px 8px', fontSize: 11, color: t.textFaint }}>COST</th>
                      </tr>
                   </thead>
                   <tbody>
                      {stats?.recent?.map((rec: any) => (
                        <tr key={rec.id} style={{ borderBottom: `1px solid ${t.border}`, fontSize: 12 }}>
                           <td style={{ padding: '12px 8px', color: t.textFaint }}>{new Date(rec.recordDate).toLocaleTimeString()}</td>
                           <td style={{ padding: '12px 8px', fontWeight: 600 }}>{rec.department}</td>
                           <td style={{ padding: '12px 8px' }}><StatusPill t={t} kind="ok" label={rec.provider} /></td>
                           <td style={{ padding: '12px 8px', color: t.textMuted }}>{rec.model}</td>
                           <td style={{ padding: '12px 8px', fontWeight: 700, color: t.accent }}>${rec.amount.toFixed(4)}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </Card>
        </div>
      </PageBody>
    </DashboardShell>
  );
}
