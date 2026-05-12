"use client";
import React, { useEffect, useState } from 'react';
import { Card, Themes, Btn, Icon, StatusPill } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { apiFetch } from '@/lib/api';

const DEPARTMENTS = ['All', 'Engineering', 'Marketing', 'Sales', 'Product', 'Legal', 'Support', 'Finance', 'HR', 'Operations'];

export default function BudgetsPage() {
  const t = Themes.navy;
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [dept, setDept] = useState('All');
  const [limit, setLimit] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchBudgets = async () => {
    if (!organization) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const json = await apiFetch('/api/budgets', {}, token || undefined, organization.id);
      if (json.success) setData(json.data.budgets);
      else setError(json.error || 'Failed to load budgets');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organization) {
      fetchBudgets();
    }
  }, [organization]);

  const handleAdd = async () => {
    if (!name || !limit || !organization) return;
    setSaving(true);
    try {
      const token = await getToken();
      await apiFetch('/api/budgets', {
        method: 'POST',
        body: JSON.stringify({ 
          name, 
          department: dept === 'All' ? null : dept, 
          monthlyLimit: parseFloat(limit),
          alertThreshold: 0.8
        }),
      }, token || undefined, organization.id);
      
      setName('');
      setLimit('');
      fetchBudgets();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteBudget = async (id: string) => {
    if (!confirm('Remove this budget cap?') || !organization) return;
    try {
      const token = await getToken();
      await apiFetch(`/api/budgets/${id}`, { method: 'DELETE' }, token || undefined, organization.id);
      fetchBudgets();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <DashboardShell persona="finance">
      <PageHeader t={t} title="Budget Controls" subtitle="Set spending limits and alert thresholds per department" />
      <PageBody t={t}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, marginBottom: 24 }}>
          <Card t={t} title="Create New Budget Cap" subtitle="Restrict AI consumption for a specific business unit">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
              <input 
                type="text" placeholder="Budget Name (e.g. Q3 Cloud Cap)" 
                value={name} onChange={e => setName(e.target.value)}
                style={{ flex: 2, padding: '10px 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, outline: 'none' }}
              />
              <select 
                value={dept} onChange={e => setDept(e.target.value)}
                style={{ flex: 1, padding: '0 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, outline: 'none' }}
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input 
                type="number" placeholder="Monthly Limit ($)" 
                value={limit} onChange={e => setLimit(e.target.value)}
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, outline: 'none' }}
              />
              <Btn t={t} kind="primary" onClick={handleAdd} disabled={saving}>
                {saving ? '...' : 'Add Cap'}
              </Btn>
            </div>
          </Card>

          <Card t={t} title="Active Alerts" subtitle="Thresholds exceeded in the last 24h">
             <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: t.dangerSoft, color: t.dangerText, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Icon name="alert" size={14} />
                   <strong>Marketing:</strong> 92% of budget consumed
                </div>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: t.warnSoft, color: t.warnText, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Icon name="info" size={14} />
                   <strong>Engineering:</strong> Approaching 80% threshold
                </div>
             </div>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {loading && <div style={{ color: t.textMuted, padding: 20 }}>Syncing with ledger...</div>}
          {error && <div style={{ color: t.danger, padding: 20 }}>Error: {error}</div>}
          {!loading && !error && data.map((item) => (
            <Card key={item.id} t={t} title={item.name} padding={20} 
              actions={<button onClick={() => deleteBudget(item.id)} style={{ border: 'none', background: 'none', color: t.textFaint, cursor: 'pointer' }}><Icon name="lock" size={14} /></button>}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div>
                     <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Limit</div>
                     <div style={{ fontSize: 20, fontWeight: 800, color: t.text }}>${item.monthlyLimit.toLocaleString()}</div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Scope</div>
                      <StatusPill t={t} kind={item.department ? 'ok' : 'off'} label={item.department || 'Org-Wide'} />
                   </div>
                </div>
                
                <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: t.textMuted, marginBottom: 4 }}>
                      <span>Current Spend</span>
                      <span style={{ fontWeight: 600 }}>65%</span>
                   </div>
                   <div style={{ height: 8, background: t.surfaceSunk, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: '65%', height: '100%', background: t.accent }} />
                   </div>
                </div>
                
                <div style={{ fontSize: 11, color: t.textFaint, paddingTop: 8, borderTop: `1px dashed ${t.border}` }}>
                   Alert threshold set at {item.alertThreshold * 100}% of total limit.
                </div>
              </div>
            </Card>
          ))}
        </div>
      </PageBody>
    </DashboardShell>
  );
}
