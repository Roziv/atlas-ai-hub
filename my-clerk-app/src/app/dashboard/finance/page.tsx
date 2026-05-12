"use client";
import React, { useState, useEffect } from 'react';
import { Card, Stat, Btn, Themes } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { apiFetch } from '@/lib/api';

export default function FinanceDashboardPage() {
  const t = Themes.navy;
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [stats, setStats] = useState<any>(null);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!organization) return;
    
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const [statsJson, forecastJson] = await Promise.all([
        apiFetch('/api/spend/stats', {}, token || undefined, organization.id),
        apiFetch('/api/forecast', {}, token || undefined, organization.id)
      ]);

      if (statsJson.success) setStats(statsJson.data);
      if (forecastJson.success) setForecasts(forecastJson.data);
      
      if (!statsJson.success) {
        throw new Error(statsJson.error || 'Failed to load financial data');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [organization, getToken]);

  if (loading) return <div style={{ padding: 40, color: t.textMuted }}>Loading financial intelligence...</div>;
  if (error) return (
    <div style={{ padding: 40 }}>
      <div style={{ padding: 20, background: t.dangerSoft, color: t.dangerText, borderRadius: 12, border: `1px solid ${t.danger}` }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Financial Service Interruption</div>
        <div style={{ fontSize: 13 }}>{error}</div>
        <Btn t={t} kind="secondary" size="sm" style={{ marginTop: 12 }} onClick={loadData}>Retry Connection</Btn>
      </div>
    </div>
  );
  if (!stats) return <div style={{ padding: 40, color: t.textMuted }}>No data available.</div>;

  const mtdK = (stats.mtdTotal / 1000).toFixed(1);
  const projK = (stats.projectedEom / 1000).toFixed(1);

  return (
    <DashboardShell persona="finance">
      <PageHeader t={t} title="Finance Dashboard" subtitle={`$${mtdK}K MTD · projecting $${projK}K end of month`}
        actions={<>
          <Btn t={t} kind="secondary" icon="filter">Current Month</Btn>
          <Btn t={t} kind="secondary" icon="download">Export</Btn>
        </>}/>
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 14 }}>
          <Card t={t}><Stat t={t} label="Spend MTD" value={`$${mtdK}K`} delta="+24%" deltaKind="down" sub="vs same time last month" /></Card>
          <Card t={t}><Stat t={t} label="Projected EOM" value={`$${projK}K`} delta="+18%" deltaKind="down" sub="vs budget" /></Card>
          <Card t={t}><Stat t={t} label="Cost / 1K req" value="$0.42" delta="−$0.08" deltaKind="up" sub="optimizations live" /></Card>
          <Card t={t}><Stat t={t} label="Active models" value="5" sub="within compliance" /></Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginBottom: 14 }}>
          <Card t={t} title="Spend over time" subtitle="Daily, last 30 days · vs budget">
             <SpendChart t={t} dailyData={stats.dailySpend} />
          </Card>

          <Card t={t} title="By provider" subtitle={`$${mtdK}K total`} padding={0}>
            {stats.providers.map((p: any, i: number) => {
              const colors: any = { openai: '#10A37F', anthropic: '#D97757', gemini: '#4285F4', aws: '#FF9900', groq: '#F55036', azure: '#0078D4' };
              const color = colors[p.name] || t.accent;
              return (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 16px', borderTop: i > 0 ? `1px solid ${t.border}` : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: color + '20', color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, textTransform: 'uppercase' }}>{p.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: t.text, textTransform: 'capitalize' }}>{p.name}</span>
                      <span style={{ fontSize: 11, color: t.successText, fontWeight: 600 }}>{p.share}% share</span>
                    </div>
                    <div style={{ height: 4, background: t.surfaceSunk, borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ width: p.share + '%', height: '100%', background: color }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: t.text, fontFamily: 'ui-monospace, monospace' }}>${(p.spend/1000).toFixed(1)}K</div>
                </div>
              );
            })}
          </Card>
        </div>

        {/* Forecasting Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {forecasts.map((f, i) => (
            <Card key={i} t={t} title={f.name} subtitle={f.desc} padding={16} 
              style={{ borderTop: f.selected ? `4px solid ${t.accent}` : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: t.text }}>{f.total}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: f.kind === 'warn' ? t.dangerText : t.successText }}>{f.delta}</div>
              </div>
              <div style={{ fontSize: 11, color: t.textFaint, marginTop: 4, textTransform: 'uppercase', fontWeight: 700 }}>Annualized Projection</div>
            </Card>
          ))}
        </div>
      </PageBody>
    </DashboardShell>
  );
}

function SpendChart({ t, dailyData }: any) {
  const days = dailyData.length || 30;
  const data = dailyData.map((d: any) => d.amount);
  const budget = 4500; // $4.5K daily budget
  const max = Math.max(...data, budget, 1000) * 1.1;
  const w = 600, h = 160;
  
  const pts = data.map((v: number, i: number) => {
    const x = (i / (days - 1)) * w;
    const y = h - (v / max) * (h - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: 'block' }}>
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1="0" x2={w} y1={h*p} y2={h*p} stroke={t.border} strokeDasharray="2,4" />
      ))}
      <line x1="0" x2={w} y1={h - (budget/max)*(h-20) - 10} y2={h - (budget/max)*(h-20) - 10}
        stroke={t.danger} strokeWidth="1.2" strokeDasharray="4,3" />
      <text x={w-4} y={h - (budget/max)*(h-20) - 13} textAnchor="end" fill={t.dangerText} fontSize="9" fontWeight="600">BUDGET $4.5K/day</text>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={t.accent} opacity="0.13" />
      <polyline points={pts} fill="none" stroke={t.accent} strokeWidth="2" />
    </svg>
  );
}
