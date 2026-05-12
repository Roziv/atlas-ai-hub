"use client";
import React, { useEffect, useState } from 'react';
import { Card, Btn, Themes, StatusPill, Icon } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { apiFetch } from '@/lib/api';

export default function ViolationsPage() {
  const t = Themes.navy;
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchViolations = async () => {
    if (!organization) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const json = await apiFetch('/api/violations', {}, token || undefined, organization.id);
      if (json.success) {
        const mapped = json.data.violations.map((v: any) => ({
          id: v.id,
          kind: v.severity === 'critical' ? 'bad' : 'warn',
          model: v.model?.name || 'Unknown Model',
          policy: v.policy?.name || 'Unknown Policy',
          issue: v.description || 'Policy violation detected',
          detected: new Date(v.createdAt).toLocaleString(),
          team: v.model?.owner?.name || 'Global',
        }));
        setViolations(mapped);
      } else {
        setError(json.error || 'Failed to load violations');
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
      fetchViolations();
    }
  }, [organization]);

  const resolveViolation = async (id: string) => {
    if (!organization) return;
    const note = prompt('Please enter a remediation note (e.g. "User warned, PII redacted"):');
    if (note === null) return;
    
    try {
      const token = await getToken();
      await apiFetch(`/api/violations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'remediated', remediation: note }),
      }, token || undefined, organization.id);
      
      setViolations(violations.filter(v => v.id !== id));
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <DashboardShell persona="manager">
      <PageHeader t={t} title="Violations" subtitle={`${violations.length} active violations requiring attention`}
        actions={<Btn t={t} kind="secondary" icon="filter">Filter</Btn>} />
      <PageBody t={t}>
        <Card t={t} padding={0}>
          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr 1fr 1fr 1.8fr 1fr',
            padding: '10px 16px', fontSize: 11, fontWeight: 600, color: t.textFaint,
            textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `1px solid ${t.border}`,
          }}>
            <div>Severity</div><div>Model</div><div>Policy</div><div>Team</div><div>Issue</div><div>Action</div>
          </div>
          {loading && <div style={{ padding: 20, textAlign: 'center', color: t.textMuted }}>Loading violations...</div>}
          {error && <div style={{ padding: 20, textAlign: 'center', color: t.danger }}>Error: {error}</div>}
          {!loading && !error && violations.map((v, i) => (
            <div key={v.id} style={{
              display: 'grid', gridTemplateColumns: '0.8fr 1.2fr 1fr 1fr 1.8fr 1fr',
              padding: '12px 16px', borderTop: i > 0 ? `1px solid ${t.border}` : 'none',
              alignItems: 'center', fontSize: 13, color: t.text,
            }}>
              <div><StatusPill t={t} kind={v.kind} label={v.kind === 'bad' ? 'Critical' : 'Warning'} /></div>
              <div style={{ fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>{v.model}</div>
              <div style={{ color: t.textMuted }}>{v.policy}</div>
              <div style={{ color: t.textMuted }}>{v.team}</div>
              <div style={{ color: t.textMuted, fontSize: 12 }}>{v.issue}</div>
              <div style={{ textAlign: 'right' }}>
                <Btn t={t} kind="secondary" size="sm" icon="check" onClick={() => resolveViolation(v.id)}>Resolve</Btn>
              </div>
            </div>
          ))}
        </Card>
      </PageBody>
    </DashboardShell>
  );
}
