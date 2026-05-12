"use client";
import React, { useState, useEffect } from 'react';
import { Card, Stat, Btn, Themes, Sparkline, Icon } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';
import { useUser } from '@clerk/nextjs';

export default function FinanceAnalyticsPage() {
  const t = Themes.navy;
  const [selectedDept, setSelectedDept] = useState('All Departments');

  const departments = ['Engineering', 'Marketing', 'Sales', 'Support', 'Legal', 'Product', 'Finance'];
  const deptSpend = [
    { name: 'Engineering', spend: 42300, usage: '1.2M tokens', trend: '+12%', color: '#7B61FF' },
    { name: 'Marketing',   spend: 18400, usage: '450K tokens', trend: '+24%', color: '#FF9900' },
    { name: 'Sales',       spend: 12100, usage: '280K tokens', trend: '−4%',  color: '#4285F4' },
    { name: 'Support',     spend: 9200,  usage: '890K tokens', trend: '+8%',  color: '#10A37F' },
    { name: 'Product',     spend: 7800,  usage: '120K tokens', trend: '+2%',  color: '#D97757' },
  ];

  return (
    <DashboardShell persona="finance">
      <PageHeader t={t} title="Finance Cost Analysis" subtitle="Deep-dive into departmental cost attribution and ROI"
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <select 
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              style={{ padding: '0 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, fontSize: 13, outline: 'none' }}
            >
              <option>All Departments</option>
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
            <Btn t={t} kind="secondary" icon="download">Export CSV</Btn>
          </div>
        } />
      
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          <Card t={t}><Stat t={t} label="Total Spend" value="$111.5K" delta="+14%" deltaKind="down" sub={selectedDept} /></Card>
          <Card t={t}><Stat t={t} label="Total Requests" value="4.2M" delta="+22%" sub="last 30 days" /></Card>
          <Card t={t}><Stat t={t} label="Active Users" value="1,284" delta="+5%" sub="across 12 depts" /></Card>
          <Card t={t}><Stat t={t} label="Avg Latency" value="420ms" delta="−12ms" deltaKind="up" sub="optimized" /></Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 20 }}>
          <Card t={t} title="Spend by Department" subtitle="Monthly breakdown of AI resource consumption">
             <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {deptSpend.map(dept => (
                  <div key={dept.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: dept.color }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{dept.name}</span>
                        <span style={{ fontSize: 11, color: t.textFaint }}>{dept.usage}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                         <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>${(dept.spend/1000).toFixed(1)}K</span>
                         <span style={{ fontSize: 11, marginLeft: 8, color: dept.trend.startsWith('−') ? t.successText : t.dangerText, fontWeight: 600 }}>{dept.trend}</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: t.surfaceAlt, borderRadius: 4, overflow: 'hidden' }}>
                       <div style={{ width: (dept.spend / 45000) * 100 + '%', height: '100%', background: dept.color, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
             </div>
          </Card>

          <Card t={t} title="Cost Attribution" subtitle="Share of total enterprise spend">
             <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <svg viewBox="0 0 100 100" width="200" height="200">
                  {deptSpend.map((dept, i) => {
                    const total = deptSpend.reduce((acc, d) => acc + d.spend, 0);
                    const percent = (dept.spend / total) * 100;
                    const offset = deptSpend.slice(0, i).reduce((acc, d) => acc + (d.spend / total) * 100, 0);
                    return (
                      <circle key={dept.name} cx="50" cy="50" r="40" fill="none" 
                        stroke={dept.color} strokeWidth="15" 
                        strokeDasharray={`${percent} ${100 - percent}`} 
                        strokeDashoffset={-offset}
                        transform="rotate(-90 50 50)" />
                    );
                  })}
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                   <div style={{ fontSize: 24, fontWeight: 800, color: t.text }}>$111K</div>
                   <div style={{ fontSize: 11, color: t.textFaint }}>TOTAL SPEND</div>
                </div>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                {deptSpend.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: t.textMuted }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: d.color }} />
                    {d.name}
                  </div>
                ))}
             </div>
          </Card>
        </div>
      </PageBody>
    </DashboardShell>
  );
}
