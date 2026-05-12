"use client";
import React from 'react';
import { Card, Stat, Icon, Avatar, Btn, Sparkline, Themes } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { apiFetch } from '@/lib/api';

export default function ManagerDashboardPage() {
  const t = Themes.navy;
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [stats, setStats] = React.useState<any>(null);
  const [logs, setLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = async () => {
    if (!organization) return;
    
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      
      const [statsJson, logsJson] = await Promise.all([
        apiFetch('/api/spend/stats', {}, token || undefined, organization.id),
        apiFetch('/api/audit?limit=5', {}, token || undefined, organization.id)
      ]);

      if (statsJson.success) setStats(statsJson.data);
      if (logsJson.success) setLogs(logsJson.data.logs);
      
      if (!statsJson.success || !logsJson.success) {
        throw new Error('Some data failed to load');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, [organization, getToken]);

  const totalSpend = stats?.mtdTotal || 0;
  const budgetLimit = 5000; // In a real app, this would come from the budgets API
  const percent = budgetLimit > 0 ? (totalSpend / budgetLimit) * 100 : 0;

  return (
    <DashboardShell persona="manager">
      <PageHeader t={t} title="AI Manager Dashboard"
        subtitle="Compliance, model health, and adoption across Acme's AI estate."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn t={t} kind="secondary" icon="download">Export</Btn>
            <Btn t={t} icon="plus">New policy</Btn>
          </div>
        }/>
      <PageBody t={t}>
        {error && (
          <div style={{ padding: 20, background: t.dangerSoft, color: t.dangerText, borderRadius: 12, marginBottom: 20, border: `1px solid ${t.danger}` }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Service Interruption</div>
            <div style={{ fontSize: 13 }}>{error}</div>
            <button 
              onClick={() => loadData()}
              style={{ marginTop: 12, padding: '6px 12px', background: t.danger, color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Cost Analysis Gauge */}
        <Card t={t} style={{ marginBottom: 20, borderLeft: `6px solid ${percent > 90 ? t.danger : percent > 70 ? t.warn : t.success}` }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                 <div style={{ fontSize: 12, fontWeight: 700, color: t.textFaint, textTransform: 'uppercase' }}>Enterprise AI Budget (Monthly)</div>
                 <div style={{ fontSize: 32, fontWeight: 800, color: t.text, marginTop: 4 }}>${totalSpend.toFixed(2)} <span style={{ fontSize: 16, color: t.textFaint, fontWeight: 400 }}>/ ${budgetLimit}</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: 14, fontWeight: 700, color: percent > 90 ? t.dangerText : t.text }}>{percent.toFixed(1)}% Consumed</div>
                 <div style={{ width: 300, height: 12, background: t.surfaceSunk, borderRadius: 6, overflow: 'hidden', marginTop: 8, border: `1px solid ${t.border}` }}>
                    <div style={{ width: `${Math.min(percent, 100)}%`, height: '100%', background: percent > 90 ? t.danger : percent > 70 ? t.warn : t.accent, transition: 'width 1s ease-in-out' }} />
                 </div>
              </div>
           </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
          <Card t={t}><Stat t={t} label="Compliance rate" value="95%" delta="+4%" sub="Across 127 prod models" /></Card>
          <Card t={t}><Stat t={t} label="Active models" value="127" delta="+3" sub="14 in staging" /></Card>
          <Card t={t}><Stat t={t} label="Policy violations" value="3" delta="−2" deltaKind="up" sub="2 critical · 1 warning" /></Card>
          <Card t={t}><Stat t={t} label="RAG distributions" value="14" sub="6 KBs · 23 consumers" /></Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
          <Card t={t} title="Critical violations" subtitle="Action required" action={
            <Btn t={t} kind="ghost" size="sm">View all →</Btn>
          } padding={0}>
            {[
              { kind: 'bad',  model: 'bert-classifier-v3', issue: 'Missing red team approval', when: '2h ago', sev: 'Critical' },
              { kind: 'bad',  model: 'gpt-summaries',       issue: 'Cost limit exceeded · 12% over', when: '4h ago', sev: 'Critical' },
              { kind: 'warn', model: 'knowledge-base-v3',   issue: 'No model card published', when: 'Yesterday', sev: 'Warning' },
            ].map((v, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderTop: i > 0 ? `1px solid ${t.border}` : 'none', cursor: 'pointer',
              }}>
                <div style={{
                  padding: '2px 8px', borderRadius: 12, fontSize: 11.5, fontWeight: 600,
                  background: v.kind === 'bad' ? t.dangerSoft : t.warnSoft,
                  color: v.kind === 'bad' ? t.dangerText : t.warnText,
                }}>{v.sev}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text, fontFamily: 'ui-monospace, monospace' }}>{v.model}</div>
                  <div style={{ fontSize: 12, color: t.textMuted }}>{v.issue}</div>
                </div>
                <div style={{ fontSize: 11.5, color: t.textFaint }}>{v.when}</div>
                <Icon name="chevR" size={13} style={{ color: t.textFaint }} />
              </div>
            ))}
          </Card>

          <Card t={t} title="Adoption">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[
                { name: 'Production models', pct: 95, n: '121 / 127' },
                { name: 'Have model cards',  pct: 84, n: '107 / 127' },
                { name: 'Red team reviewed', pct: 71, n: '90 / 127' },
                { name: 'In adoption survey',pct: 62, n: '79 / 127' },
              ].map(d => (
                <div key={d.name}>
                  <div style={{ display: 'flex', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ flex: 1, color: t.text, fontWeight: 500 }}>{d.name}</span>
                    <span style={{ color: t.textFaint }}>{d.n}</span>
                    <span style={{ color: t.text, fontWeight: 600, marginLeft: 10, fontFamily: 'ui-monospace, monospace', minWidth: 30, textAlign: 'right' }}>{d.pct}%</span>
                  </div>
                  <div style={{ height: 5, background: t.surfaceSunk, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: d.pct + '%', height: '100%', background: t.accent }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ height: 14 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Card t={t} title="Model cost · last 30d">
            <Sparkline t={t} data={[42,48,51,47,52,58,64,61,68,72,69,75,82,79,88,92,87,94,99,103,98,107,114,109,118,124,121,131,138,142]} height={70} />
            <div style={{ display: 'flex', marginTop: 8, justifyContent: 'space-between', fontSize: 11, color: t.textFaint }}>
              <span>Apr 1</span><span>$42K → $142K</span><span>Apr 30</span>
            </div>
          </Card>
          <Card t={t} title="Recent activity" padding={0}>
            {logs.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: t.textFaint }}>No recent activity</div>}
            {logs.map((a, i) => {
              const when = new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: i > 0 ? `1px solid ${t.border}` : 'none' }}>
                  <Avatar name={a.user?.name || 'System'} size={24} />
                  <div style={{ flex: 1, fontSize: 12.5, color: t.textMuted }}>
                    <span style={{ color: t.text, fontWeight: 600 }}>{a.user?.name || 'System'}</span>{' '}
                    <span style={{ textTransform: 'lowercase' }}>{a.action.replace('_', ' ')}</span>{' '}
                    <span style={{ color: t.text }}>{JSON.parse(a.details || '{}').name || ''}</span>
                  </div>
                  <span style={{ fontSize: 11, color: t.textFaint }}>{when}</span>
                </div>
              );
            })}
          </Card>
        </div>
      </PageBody>
    </DashboardShell>
  );
}
