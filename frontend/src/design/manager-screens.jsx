import React, { useEffect, useState } from 'react';
import { Card, Stat, StatusPill, Icon, Avatar, Btn, Sparkline, SectionTitle, Toggle, ProviderMark, Status, BarChart } from './system';
import { PageHeader, PageBody } from './Shell';

// ── 1. Dashboard ────────────────────────────────────────
export function MgrDashboard({ t, go }) {
  return (
    <>
      <PageHeader t={t} title="AI Manager Dashboard"
        subtitle="Compliance, model health, and adoption across Acme's AI estate."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn t={t} kind="secondary" icon="download">Export</Btn>
            <Btn t={t} icon="plus">New policy</Btn>
          </div>
        }/>
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
          <Card t={t}><Stat t={t} label="Compliance rate" value="95%" delta="+4%" sub="Across 127 prod models" /></Card>
          <Card t={t}><Stat t={t} label="Active models" value="127" delta="+3" sub="14 in staging" /></Card>
          <Card t={t}><Stat t={t} label="Policy violations" value="3" delta="−2" deltaKind="up" sub="2 critical · 1 warning" /></Card>
          <Card t={t}><Stat t={t} label="RAG distributions" value="14" sub="6 KBs · 23 consumers" /></Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
          <Card t={t} title="Critical violations" subtitle="Action required" action={
            <Btn t={t} kind="ghost" size="sm" onClick={() => go('m-violations')}>View all →</Btn>
          } padding={0}>
            {[
              { kind: 'bad',  model: 'bert-classifier-v3', issue: 'Missing red team approval', when: '2h ago', sev: 'Critical' },
              { kind: 'bad',  model: 'gpt-summaries',       issue: 'Cost limit exceeded · 12% over', when: '4h ago', sev: 'Critical' },
              { kind: 'warn', model: 'knowledge-base-v3',   issue: 'No model card published', when: 'Yesterday', sev: 'Warning' },
            ].map((v, i) => (
              <div key={i} onClick={() => go('m-violation-detail')} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderTop: i > 0 ? `1px solid ${t.border}` : 'none', cursor: 'pointer',
              }}>
                <StatusPill t={t} kind={v.kind} label={v.sev} />
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
            {[
              { who: 'Devi Rao',  did: 'deployed policy', what: 'PII redaction · all prod', when: '12m' },
              { who: 'CI bot',    did: 'flagged',         what: 'gpt-summaries cost spike',  when: '2h' },
              { who: 'Lin Tan',   did: 'requested review',what: 'bert-classifier-v3',         when: '4h' },
              { who: 'System',    did: 'distributed',     what: 'Product-Docs-Q2 · 4 models', when: '6h' },
            ].map((a,i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: i>0?`1px solid ${t.border}`:'none' }}>
                <Avatar name={a.who} size={24} />
                <div style={{ flex: 1, fontSize: 12.5, color: t.textMuted }}>
                  <span style={{ color: t.text, fontWeight: 600 }}>{a.who}</span> {a.did}{' '}
                  <span style={{ color: t.text }}>{a.what}</span>
                </div>
                <span style={{ fontSize: 11, color: t.textFaint }}>{a.when}</span>
              </div>
            ))}
          </Card>
        </div>
      </PageBody>
    </>
  );
}

// ── 2. Model Registry ───────────────────────────────────
export function MgrModels({ t, go }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/models')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const mapped = json.data.models.map(m => {
            const hasViolations = m.violations && m.violations.length > 0;
            const kind = hasViolations ? (m.violations.some(v => v.severity === 'critical') ? 'bad' : 'warn') : 'ok';
            return {
              name: m.name,
              team: m.metadata?.team || 'Unknown',
              base: m.type,
              stage: 'production',
              kind: kind,
              ver: m.metadata?.version || '1.0.0',
              users: m.metadata?.users || Math.floor(Math.random() * 100),
              cost: m.metadata?.cost || 'TBD'
            };
          });
          setModels(mapped);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
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
          {!loading && models.map((m, i) => (
            <div key={m.name} style={{
              display: 'grid', gridTemplateColumns: '2.4fr 1.2fr 1.2fr 1fr 1fr 1fr 0.6fr',
              padding: '12px 16px', borderTop: i > 0 ? `1px solid ${t.border}` : 'none',
              alignItems: 'center', fontSize: 13, color: t.text,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Icon name="cpu" size={14} style={{ color: t.textFaint }} />
                <div>
                  <div style={{ fontWeight: 600, fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: t.textFaint }}>v{m.ver} · {m.users} users</div>
                </div>
              </div>
              <div style={{ color: t.textMuted }}>{m.team}</div>
              <div style={{ color: t.textMuted, fontFamily: 'ui-monospace, monospace', fontSize: 12, textTransform: 'capitalize' }}>{m.base}</div>
              <div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 4,
                  background: m.stage === 'production' ? t.accentSoft : m.stage === 'staging' ? t.warnSoft : t.chip,
                  color: m.stage === 'production' ? t.accentText : m.stage === 'staging' ? t.warnText : t.textFaint,
                  textTransform: 'uppercase', letterSpacing: 0.4,
                }}>{m.stage}</span>
              </div>
              <div><StatusPill t={t} kind={m.kind} /></div>
              <div style={{ color: t.textMuted, fontSize: 12.5 }}>{m.cost}</div>
              <div style={{ textAlign: 'right' }}><Icon name="more" size={14} style={{ color: t.textFaint }} /></div>
            </div>
          ))}
        </Card>
      </PageBody>
    </>
  );
}

// ── 3. Policy Library ───────────────────────────────────
export function MgrPolicies({ t, go }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  const templates = [
    { name: 'Red Team Approved',  desc: 'Require security review before deployment', icon: 'shield', deployed: true,  scope: 'All production', updated: '3d' },
    { name: 'PII Redaction',      desc: 'Auto-mask sensitive data in prompts/responses', icon: 'lock',   deployed: true,  scope: 'Customer Support', updated: '12m' },
    { name: 'Cost Threshold',     desc: 'Alert when model spend exceeds budget', icon: 'coin',   deployed: false, scope: '-', updated: '5d' },
  ];

  useEffect(() => {
    fetch('http://localhost:3000/api/policies')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const mapped = json.data.policies.map((p) => ({
            id: p.id,
            name: p.name,
            desc: p.description || 'No description',
            icon: p.ruleType === 'security' ? 'shield' : p.ruleType === 'cost' ? 'coin' : 'doc',
            deployed: true,
            scope: 'Global',
            updated: 'Just now'
          }));
          setPolicies(mapped);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <PageHeader t={t} title="Policy library" subtitle="Templates and custom rules. Enforced at deployment."
        actions={<Btn t={t} icon="plus" onClick={() => go('m-editor')}>Create policy</Btn>} />
      <PageBody t={t}>
        <SectionTitle t={t} subtitle="Pre-built starting points">Templates</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {templates.map((p, i) => (
            <PolicyCard key={i} t={t} p={p} onClick={() => go('m-editor')} />
          ))}
        </div>

        <SectionTitle t={t} subtitle="Custom rules for your organization">Active Policies</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {loading && <div style={{ color: t.textMuted }}>Loading custom policies...</div>}
          {!loading && policies.map((p) => (
            <PolicyCard key={p.id} t={t} p={p} onClick={() => go('m-editor')} />
          ))}
        </div>
      </PageBody>
    </>
  );
}

const PolicyCard = ({ t, p, onClick }) => (
  <div onClick={onClick} style={{
    background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.radiusLg,
    padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10,
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{
        width: 32, height: 32, borderRadius: t.radiusMd, background: t.accentSoft, color: t.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Icon name={p.icon} size={15} /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text }}>{p.name}</div>
        <div style={{ fontSize: 11.5, color: t.textFaint }}>Updated {p.updated}</div>
      </div>
      {p.deployed && <StatusPill t={t} kind="ok" label="Active" />}
    </div>
    <div style={{ fontSize: 12.5, color: t.textMuted, lineHeight: 1.5 }}>{p.desc}</div>
    <div style={{ paddingTop: 8, marginTop: 'auto', borderTop: `1px dashed ${t.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
      <Icon name="target" size={11} style={{ color: t.textFaint }} />
      <span style={{ fontSize: 11.5, color: t.textMuted }}>{p.deployed ? p.scope : 'Not deployed'}</span>
    </div>
  </div>
);

// ── 4. Violations ───────────────────────────────────────
export function MgrViolations({ t, go }) {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/violations')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const mapped = json.data.violations.map((v) => ({
            id: v.id,
            kind: v.severity === 'critical' ? 'bad' : 'warn',
            model: v.model?.name || 'Unknown Model',
            policy: v.policy?.name || 'Unknown Policy',
            issue: v.details || 'Policy violation detected',
            detected: 'Just now',
            team: v.model?.owner?.name || 'Unknown Team',
          }));
          setViolations(mapped);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const criticalCount = violations.filter((v) => v.kind === 'bad').length;
  const warnCount = violations.filter((v) => v.kind === 'warn').length;

  return (
    <>
      <PageHeader t={t} title="Violations" subtitle={`${criticalCount} critical · ${warnCount} warnings`}
        actions={<Btn t={t} kind="secondary" icon="refresh" onClick={() => window.location.reload()}>Re-scan</Btn>} />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
          <ZoneCard t={t} kind="bad"  count={criticalCount} label="Critical" desc="Block deployment. Action required." />
          <ZoneCard t={t} kind="warn" count={warnCount} label="Warnings"  desc="Non-blocking. Review by EOW." />
          <ZoneCard t={t} kind="ok"   count={127} label="Healthy" desc="No active issues." />
        </div>

        <Card t={t} title="Active violations" padding={0}>
          {loading && <div style={{ padding: 16, color: t.textMuted }}>Loading violations...</div>}
          {!loading && violations.map((x, i) => (
            <div key={x.id || i} onClick={() => go('m-violation-detail')} style={{
              display: 'grid', gridTemplateColumns: '90px 1.6fr 1.2fr 2fr 1fr 30px',
              alignItems: 'center', gap: 12, padding: '12px 16px',
              borderTop: i > 0 ? `1px solid ${t.border}` : 'none', cursor: 'pointer',
            }}>
              <StatusPill t={t} kind={x.kind} label={x.kind === 'bad' ? 'Critical' : 'Warning'} />
              <div style={{ fontSize: 12.5, fontWeight: 600, color: t.text, fontFamily: 'ui-monospace, monospace' }}>{x.model}</div>
              <div style={{ fontSize: 12, color: t.textMuted }}>{x.policy}</div>
              <div style={{ fontSize: 12.5, color: t.text }}>{x.issue}</div>
              <div style={{ fontSize: 11.5, color: t.textFaint }}>{x.detected} · {x.team}</div>
              <Icon name="chevR" size={13} style={{ color: t.textFaint }} />
            </div>
          ))}
        </Card>
      </PageBody>
    </>
  );
}

const ZoneCard = ({ t, kind, count, label, desc }) => {
  const s = Status[kind](t);
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`, borderLeft: `4px solid ${s.dot}`,
      borderRadius: t.radiusLg, padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: s.fg, letterSpacing: -0.5 }}>{count}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{label}</div>
      </div>
      <div style={{ fontSize: 12, color: t.textMuted }}>{desc}</div>
    </div>
  );
};

// ── 5. Policy Editor ────────────────────────────────────
export function MgrEditor({ t, go }) {
  return (
    <>
      <PageHeader t={t}
        breadcrumb={['Policies', 'Red Team Approved']}
        title="Red Team Approved"
        subtitle="Require security review before any deployment to production."
        actions={<>
          <Btn t={t} kind="secondary" onClick={() => go('m-policies')}>Cancel</Btn>
          <Btn t={t} kind="secondary">Save draft</Btn>
          <Btn t={t} icon="check">Deploy policy</Btn>
        </>} />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
          <Card t={t} title="Conditions" subtitle="When this rule fires" padding={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <RuleRow t={t} when="Model is" value="deployed to production" />
              <div style={{ paddingLeft: 18, color: t.textFaint, fontSize: 11, fontWeight: 600 }}>AND</div>
              <RuleRow t={t} when="Approval status is" value="not approved" />
              <div style={{ paddingLeft: 18, color: t.textFaint, fontSize: 11, fontWeight: 600 }}>AND</div>
              <RuleRow t={t} when="Risk tier is" value="medium or higher" />
              <button style={{
                marginTop: 4, padding: '8px 12px', border: `1px dashed ${t.border}`, borderRadius: t.radiusMd,
                background: 'transparent', color: t.textMuted, fontSize: 12.5, cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
              }}>
                <Icon name="plus" size={11} /> Add condition
              </button>
            </div>
            <div style={{ height: 18 }} />
            <div style={{ fontSize: 11, fontWeight: 600, color: t.textFaint, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Then</div>
            <div style={{ padding: 14, background: t.dangerSoft, borderRadius: t.radiusMd, border: `1px solid ${t.danger}33` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="lock" size={14} style={{ color: t.dangerText }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: t.dangerText }}>Block deployment</div>
              </div>
              <div style={{ fontSize: 12, color: t.dangerText, marginTop: 5, opacity: 0.85 }}>
                Notify Chief AI Officer + Security Lead. Log to audit trail. Auto-escalate after 24 hours.
              </div>
            </div>
          </Card>

          <Card t={t} title="Settings" padding={16}>
            <FieldGroup t={t} label="Required approvers">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                <ApproverChip t={t} name="Chief AI Officer" />
                <ApproverChip t={t} name="Security Lead" />
                <button style={{ padding: '3px 8px', borderRadius: 10, border: `1px dashed ${t.border}`, background: 'transparent', color: t.textFaint, fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add</button>
              </div>
            </FieldGroup>
            <FieldGroup t={t} label="SLA">
              <SelectField t={t} value="24 hours" />
            </FieldGroup>
            <FieldGroup t={t} label="Scope">
              <SelectField t={t} value="All production models" />
            </FieldGroup>
            <FieldGroup t={t} label="Enforcement">
              <ToggleRow t={t} label="Enforce at deployment" on />
              <ToggleRow t={t} label="Notify via Slack" on />
              <ToggleRow t={t} label="Block API access if violated" />
            </FieldGroup>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

const RuleRow = ({ t, when, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: t.surfaceAlt, borderRadius: t.radiusMd, border: `1px solid ${t.border}` }}>
    <span style={{ fontSize: 12, color: t.textMuted }}>{when}</span>
    <div style={{ padding: '3px 8px', background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.radiusSm, fontSize: 12.5, fontWeight: 550, color: t.text, display: 'flex', alignItems: 'center', gap: 5 }}>
      {value} <Icon name="chevD" size={10} style={{ color: t.textFaint }} />
    </div>
    <div style={{ flex: 1 }} />
    <Icon name="more" size={13} style={{ color: t.textFaint, cursor: 'pointer' }} />
  </div>
);
const FieldGroup = ({ t, label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: t.textFaint, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
    {children}
  </div>
);
const SelectField = ({ t, value }) => (
  <div style={{ padding: '7px 10px', border: `1px solid ${t.border}`, borderRadius: t.radiusMd, background: t.surfaceAlt, fontSize: 12.5, color: t.text, display: 'flex', alignItems: 'center' }}>
    <span style={{ flex: 1 }}>{value}</span>
    <Icon name="chevD" size={11} style={{ color: t.textFaint }} />
  </div>
);
const ApproverChip = ({ t, name }) => (
  <span style={{ padding: '3px 9px 3px 4px', borderRadius: 11, fontSize: 11.5, fontWeight: 550, background: t.accentSoft, color: t.accentText, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
    <Avatar name={name} size={16} /> {name}
  </span>
);
const ToggleRow = ({ t, label, on }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
    <span style={{ flex: 1, fontSize: 12.5, color: t.text }}>{label}</span>
    <Toggle t={t} on={on} />
  </div>
);

// ── 6. Violation Detail ─────────────────────────────────
export function MgrViolationDetail({ t, go }) {
  return (
    <>
      <PageHeader t={t}
        breadcrumb={['Violations', 'bert-classifier-v3']}
        title="bert-classifier-v3 · Red Team Approval missing"
        subtitle="Detected 2 hours ago by automated policy scan."
        actions={<>
          <Btn t={t} kind="secondary" onClick={() => go('m-violations')}>Back</Btn>
          <Btn t={t} kind="secondary">Adjust parameters</Btn>
          <Btn t={t} icon="check">Submit for review</Btn>
        </>} />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Card t={t} title="Failure reason">
              <div style={{ padding: 14, background: t.dangerSoft, border: `1px solid ${t.danger}33`, borderRadius: t.radiusMd, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <Icon name="alert" size={14} style={{ color: t.dangerText }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.dangerText }}>Required approver did not sign off</div>
                </div>
                <div style={{ fontSize: 12.5, color: t.dangerText, opacity: 0.85, lineHeight: 1.5 }}>
                  Policy <strong>Red Team Approved</strong> requires sign-off from Chief AI Officer and Security Lead before any production deployment with risk tier ≥ medium. This model deployed at 14:22 UTC without security sign-off.
                </div>
              </div>

              <div style={{ fontSize: 11, fontWeight: 600, color: t.textFaint, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Remediation options</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <RemediationRow t={t} icon="check"  label="Submit for red team review" hint="Notification queued to Slack · ~24h SLA" recommended />
                <RemediationRow t={t} icon="edit"   label="Adjust risk tier" hint="Re-classify the model and re-run checks" />
                <RemediationRow t={t} icon="refresh"label="Roll back to v2.3.4"   hint="Last approved version · Mar 12" />
              </div>
            </Card>

            <Card t={t} title="Audit trail">
              {[
                { who: 'Lin Tan', did: 'deployed v3.0.0 to prod', when: '2h ago', kind: 'bad' },
                { who: 'CI scan', did: 'flagged red team violation', when: '2h ago', kind: 'bad' },
                { who: 'Lin Tan', did: 'opened deployment PR', when: '1d ago', kind: 'off' },
                { who: 'CI scan', did: 'passed cost-limit check on v3.0.0', when: '1d ago', kind: 'ok' },
                { who: 'Devi Rao', did: 'approved v2.3.4 deployment', when: '52d ago', kind: 'ok' },
              ].map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: i > 0 ? `1px solid ${t.border}` : 'none' }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: e.kind === 'bad' ? t.danger : e.kind === 'ok' ? t.success : t.textFaint }} />
                  <div style={{ flex: 1, fontSize: 12.5, color: t.text }}>
                    <span style={{ fontWeight: 600 }}>{e.who}</span> <span style={{ color: t.textMuted }}>{e.did}</span>
                  </div>
                  <span style={{ fontSize: 11.5, color: t.textFaint }}>{e.when}</span>
                </div>
              ))}
            </Card>
          </div>

          <Card t={t} title="Model details">
            <KV t={t} k="Model" v="bert-classifier-v3" mono />
            <KV t={t} k="Owner" v="Lin Tan · Trust & Safety" />
            <KV t={t} k="Risk tier" v="High" pillKind="bad" />
            <KV t={t} k="Deployment" v="14:22 UTC · today" />
            <KV t={t} k="Endpoint" v="api.acme.corp/bert/v3" mono />
            <KV t={t} k="Inference / day" v="~12,400 requests" />
            <KV t={t} k="Last approved" v="v2.3.4 · Mar 12" />
          </Card>
        </div>
      </PageBody>
    </>
  );
}

const RemediationRow = ({ t, icon, label, hint, recommended }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10, padding: 12,
    background: recommended ? t.accentSoft : t.surfaceAlt,
    border: `1px solid ${recommended ? t.accent + '40' : t.border}`,
    borderRadius: t.radiusMd, cursor: 'pointer',
  }}>
    <div style={{ width: 28, height: 28, borderRadius: t.radiusSm, background: t.surface, color: recommended ? t.accent : t.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={13} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: t.text }}>{label}</div>
      <div style={{ fontSize: 11.5, color: t.textMuted }}>{hint}</div>
    </div>
    {recommended && <span style={{ fontSize: 10.5, fontWeight: 700, color: t.accentText, padding: '2px 6px', borderRadius: 3, background: t.surface, letterSpacing: 0.5 }}>RECOMMENDED</span>}
  </div>
);

const KV = ({ t, k, v, mono, pillKind }) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderTop: `1px solid ${t.border}`, fontSize: 12.5 }}>
    <span style={{ width: 110, color: t.textFaint, fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k}</span>
    {pillKind ? <StatusPill t={t} kind={pillKind} label={v} /> :
      <span style={{ color: t.text, fontFamily: mono ? 'ui-monospace, monospace' : 'inherit', fontSize: mono ? 12 : 12.5 }}>{v}</span>}
  </div>
);

// ── 7. RAG Library ──────────────────────────────────────
export function MgrRag({ t, go }) {
  const kbs = [
    { name: 'Product-Docs-Q2',     team: 'Product',      docs: 1247, chunks: '14.2K', size: '2.1 GB', updated: '2h ago', consumers: 4, status: 'ok' },
    { name: 'Legal-Contracts-2024',team: 'Legal',        docs: 892,  chunks: '24.7K', size: '4.6 GB', updated: '1d ago', consumers: 3, status: 'ok' },
    { name: 'Engineering-Wiki',    team: 'Engineering',  docs: 3421, chunks: '38.1K', size: '6.2 GB', updated: '4h ago', consumers: 7, status: 'ok' },
    { name: 'Customer-Support-KB', team: 'Support',      docs: 2104, chunks: '19.5K', size: '3.4 GB', updated: '12h ago',consumers: 5, status: 'warn' },
    { name: 'Sales-Playbooks',     team: 'Sales',        docs: 142,  chunks: '1.8K',  size: '0.4 GB', updated: '3d ago', consumers: 2, status: 'ok' },
    { name: 'HR-Handbook',         team: 'People Ops',   docs: 78,   chunks: '0.9K',  size: '0.1 GB', updated: '5d ago', consumers: 2, status: 'ok' },
  ];
  return (
    <>
      <PageHeader t={t} title="RAG library" subtitle="6 knowledge bases · 23 consuming systems · centralized ingestion"
        actions={<>
          <Btn t={t} kind="secondary" icon="upload">Ingest</Btn>
          <Btn t={t} icon="plus">New KB</Btn>
        </>} />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {kbs.map(kb => (
            <div key={kb.name} onClick={() => go('m-rag-detail')} style={{
              background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.radiusLg,
              padding: 16, cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: t.radiusMd, background: t.accentSoft, color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="book" size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.text, fontFamily: 'ui-monospace, monospace', marginBottom: 1 }}>{kb.name}</div>
                  <div style={{ fontSize: 11.5, color: t.textFaint }}>{kb.team} · updated {kb.updated}</div>
                </div>
                <StatusPill t={t} kind={kb.status} label={kb.status === 'ok' ? 'Synced' : 'Stale'} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, padding: 10, background: t.surfaceAlt, borderRadius: t.radiusMd }}>
                <KbStat t={t} label="Docs"      value={kb.docs.toLocaleString()} />
                <KbStat t={t} label="Chunks"    value={kb.chunks} />
                <KbStat t={t} label="Size"      value={kb.size} />
                <KbStat t={t} label="Consumers" value={kb.consumers} />
              </div>
            </div>
          ))}
        </div>
      </PageBody>
    </>
  );
}
const KbStat = ({ t, label, value }) => (
  <div>
    <div style={{ fontSize: 10, color: t.textFaint, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginTop: 1, fontFamily: 'ui-monospace, monospace' }}>{value}</div>
  </div>
);

// ── 8. RAG Detail ───────────────────────────────────────
export function MgrRagDetail({ t, go }) {
  const consumers = [
    { name: 'product-help-bot',  team: 'Customer Insights', queries: '4.2K/day', status: 'ok' },
    { name: 'sales-research',    team: 'Sales',             queries: '1.1K/day', status: 'ok' },
    { name: 'support-router',    team: 'Support',           queries: '8.4K/day', status: 'ok' },
    { name: 'docs-search-v2',    team: 'Product',           queries: '12K/day',  status: 'warn' },
  ];
  return (
    <>
      <PageHeader t={t}
        breadcrumb={['RAG library', 'Product-Docs-Q2']}
        title="Product-Docs-Q2"
        subtitle="Source of truth for 4 production systems · last sync 2h ago"
        actions={<>
          <Btn t={t} kind="secondary" icon="refresh">Re-index</Btn>
          <Btn t={t} kind="secondary" onClick={() => go('m-rag')}>Back</Btn>
        </>} />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14 }}>
          <Card t={t} title="Sources" padding={0}>
            {[
              { name: 'docs/api-reference', kind: 'GitHub', count: 412 },
              { name: 'help.acme.com',      kind: 'Web',    count: 287 },
              { name: 'product-spec/',      kind: 'Notion', count: 391 },
              { name: 'changelog.md',       kind: 'GitHub', count: 157 },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderTop: i > 0 ? `1px solid ${t.border}` : 'none' }}>
                <Icon name="folder" size={14} style={{ color: t.textFaint }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: t.text, fontFamily: 'ui-monospace, monospace' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: t.textFaint }}>{s.kind} · {s.count} docs</div>
                </div>
                <Icon name="check" size={13} style={{ color: t.success }} />
              </div>
            ))}
          </Card>

          <Card t={t} title="Distribution" subtitle="Systems consuming this knowledge base" padding={0}>
            <div style={{ padding: 18, background: t.surfaceAlt, borderBottom: `1px solid ${t.border}` }}>
              <svg viewBox="0 0 360 130" width="100%" height="130" style={{ display: 'block' }}>
                {[0,1,2,3].map(i => (
                  <line key={i} x1="60" y1="65" x2="280" y2={20 + i*30}
                    stroke={t.borderStrong} strokeWidth="1" strokeDasharray="3,3" />
                ))}
                <rect x="10" y="48" width="100" height="34" rx="4" fill={t.accent} />
                <text x="60" y="69" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="600">Product-Docs</text>
                {consumers.map((c, i) => (
                  <g key={i}>
                    <rect x="280" y={6 + i*30} width="76" height="22" rx="3" fill={t.surface} stroke={t.border} />
                    <text x="318" y={20 + i*30} textAnchor="middle" fill={t.text} fontSize="9.5" fontFamily="ui-monospace, monospace">{c.name}</text>
                  </g>
                ))}
              </svg>
            </div>
            {consumers.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 80px', alignItems: 'center', gap: 10, padding: '11px 16px', borderTop: i > 0 ? `1px solid ${t.border}` : 'none' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: t.text, fontFamily: 'ui-monospace, monospace' }}>{c.name}</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>{c.team}</div>
                <div style={{ fontSize: 12, color: t.textMuted, fontFamily: 'ui-monospace, monospace' }}>{c.queries}</div>
                <StatusPill t={t} kind={c.status} label={c.status === 'ok' ? 'Live' : 'Stale'} />
              </div>
            ))}
          </Card>
        </div>
      </PageBody>
    </>
  );
}

// ── 9. Analytics ────────────────────────────────────────
export function MgrAnalytics({ t, go }) {
  const teams = ['Eng', 'Sales', 'Support', 'Legal', 'Product', 'Marketing', 'Finance'];
  const teamData = teams.map((tn, i) => ({ l: tn, v: [62, 41, 78, 23, 55, 36, 19][i], color: t.accent }));
  return (
    <>
      <PageHeader t={t} title="Analytics" subtitle="Adoption, cost, and health trends across the AI estate"
        actions={<Btn t={t} kind="secondary" icon="download">Export CSV</Btn>} />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
          <Card t={t}><Stat t={t} label="Daily inferences" value="2.4M" delta="+18%" sub="vs prior week" /></Card>
          <Card t={t}><Stat t={t} label="Avg latency"     value="284ms" delta="−12ms" deltaKind="up" sub="p95 across all" /></Card>
          <Card t={t}><Stat t={t} label="Active users"    value="1,847" delta="+124" sub="last 7 days" /></Card>
          <Card t={t}><Stat t={t} label="Tools deployed"  value="42" sub="14 this quarter" /></Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14, marginBottom: 14 }}>
          <Card t={t} title="Inferences over time" subtitle="Past 30 days, all models">
            <Sparkline t={t} data={[12,14,15,13,18,21,19,24,28,26,31,34,32,38,42,39,45,48,46,52,58,54,61,67,63,70,75,71,79,84]} height={120} />
          </Card>
          <Card t={t} title="Adoption by team">
            <BarChart t={t} data={teamData} height={120} />
          </Card>
        </div>

        <Card t={t} title="Top models by usage" padding={0}>
          {[
            { name: 'support-router',     team: 'Support',            req: '342K/day', share: 28, lat: '198ms' },
            { name: 'gpt-summaries-v2',   team: 'Customer Insights',  req: '184K/day', share: 15, lat: '412ms' },
            { name: 'tern-8b-finetune',   team: 'Engineering',        req: '156K/day', share: 13, lat: '92ms'  },
            { name: 'sales-research',     team: 'Sales',              req: '94K/day',  share: 8,  lat: '2.1s'  },
            { name: 'invoice-ocr',        team: 'Finance',            req: '47K/day',  share: 4,  lat: '614ms' },
          ].map((m, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1.4fr', gap: 12, padding: '12px 16px', alignItems: 'center', borderTop: i > 0 ? `1px solid ${t.border}` : 'none' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: t.text, fontFamily: 'ui-monospace, monospace' }}>{m.name}</div>
              <div style={{ fontSize: 12, color: t.textMuted }}>{m.team}</div>
              <div style={{ fontSize: 12, color: t.text, fontFamily: 'ui-monospace, monospace' }}>{m.req}</div>
              <div style={{ fontSize: 12, color: t.textMuted, fontFamily: 'ui-monospace, monospace' }}>{m.lat}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 5, background: t.surfaceSunk, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${m.share * 3.5}%`, height: '100%', background: t.accent }} />
                </div>
                <span style={{ fontSize: 11, color: t.textFaint, fontFamily: 'ui-monospace, monospace', minWidth: 30, textAlign: 'right' }}>{m.share}%</span>
              </div>
            </div>
          ))}
        </Card>
      </PageBody>
    </>
  );
}

// ── 10. Department Report ───────────────────────────────
export function MgrDeptReport({ t, go }) {
  const depts = [
    { name: 'Engineering', users: 412, active: 338, runs: '184K', cost: '$24.8K', topTool: 'tern-8b-finetune', growth: 18, share: 26 },
    { name: 'Support',     users: 286, active: 271, runs: '342K', cost: '$18.2K', topTool: 'support-router',   growth: 12, share: 22 },
    { name: 'Sales',       users: 198, active: 142, runs: '94K',  cost: '$12.6K', topTool: 'sales-research',   growth: 24, share: 15 },
    { name: 'Customer Insights', users: 84, active: 71, runs: '88K', cost: '$9.4K', topTool: 'gpt-summaries-v2', growth: 8,  share: 11 },
    { name: 'Product',     users: 142, active: 96,  runs: '62K',  cost: '$7.1K', topTool: 'product-help-bot', growth: 32, share: 9 },
    { name: 'Legal',       users: 38,  active: 31,  runs: '12K',  cost: '$4.6K', topTool: 'NDA Reviewer',     growth: 41, share: 6 },
    { name: 'Marketing',   users: 64,  active: 38,  runs: '18K',  cost: '$3.2K', topTool: 'Brand Voice',      growth: 6,  share: 5 },
    { name: 'Finance',     users: 52,  active: 24,  runs: '14K',  cost: '$2.8K', topTool: 'invoice-ocr',      growth: -4, share: 4 },
    { name: 'People',      users: 28,  active: 19,  runs: '4.2K', cost: '$1.1K', topTool: 'Onboarding Asst.', growth: 14, share: 2 },
  ];

  return (
    <>
      <PageHeader t={t} title="Usage by department"
        subtitle="Adoption, activity, and spend across all departments · last 30 days"
        actions={<>
          <Btn t={t} kind="secondary" icon="download">Export CSV</Btn>
          <Btn t={t} kind="secondary">Last 30 days</Btn>
        </>} />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
          <Card t={t}><Stat t={t} label="Departments using AI"  value="9 of 11" sub="People + 2 piloting" /></Card>
          <Card t={t}><Stat t={t} label="Org adoption"           value="68%"   delta="+9%"  sub="of eligible seats" /></Card>
          <Card t={t}><Stat t={t} label="Total runs"             value="818K"  delta="+14%" sub="vs prior 30d" /></Card>
          <Card t={t}><Stat t={t} label="Total spend"            value="$83.8K" delta="+11%" sub="across all depts" /></Card>
        </div>

        <Card t={t} title="Departments" subtitle="Click a row to drill in" padding={0}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1fr 1fr 1.6fr 1.2fr 0.6fr',
            padding: '10px 16px', fontSize: 10.5, fontWeight: 600, color: t.textFaint,
            textTransform: 'uppercase', letterSpacing: 0.6, borderBottom: `1px solid ${t.border}`,
            background: t.surfaceSunk,
          }}>
            <div>Department</div>
            <div>Adoption</div>
            <div>Runs (30d)</div>
            <div>Spend</div>
            <div>Top tool</div>
            <div>Share of org</div>
            <div style={{ textAlign: 'right' }}>Growth</div>
          </div>
          {depts.map((d, i) => (
            <div key={d.name} style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1fr 1fr 1.6fr 1.2fr 0.6fr',
              padding: '14px 16px', alignItems: 'center', borderTop: i > 0 ? `1px solid ${t.border}` : 'none',
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ProviderMark seed={d.name} size={28} />
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{d.name}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 5, background: t.surfaceSunk, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(d.active/d.users)*100}%`, height: '100%', background: t.accent }} />
                  </div>
                  <span style={{ fontSize: 11, color: t.textFaint, fontFamily: 'ui-monospace, monospace', minWidth: 56, textAlign: 'right' }}>
                    {d.active}/{d.users}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: t.text, fontFamily: 'ui-monospace, monospace' }}>{d.runs}</div>
              <div style={{ fontSize: 12.5, color: t.text, fontFamily: 'ui-monospace, monospace' }}>{d.cost}</div>
              <div style={{ fontSize: 12, color: t.textMuted, fontFamily: 'ui-monospace, monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.topTool}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 5, background: t.surfaceSunk, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${d.share * 3.5}%`, height: '100%', background: t.accent, opacity: 0.7 }} />
                </div>
                <span style={{ fontSize: 11, color: t.textFaint, fontFamily: 'ui-monospace, monospace', minWidth: 28, textAlign: 'right' }}>{d.share}%</span>
              </div>
              <div style={{
                fontSize: 11.5, fontWeight: 600, textAlign: 'right',
                color: d.growth > 0 ? t.successText : t.textMuted,
              }}>{d.growth > 0 ? '+' : ''}{d.growth}%</div>
            </div>
          ))}
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
          <Card t={t} title="Tool usage by department" subtitle="Which categories each dept relies on">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { dept: 'Engineering', segs: [{ l: 'Code', v: 48 }, { l: 'RAG', v: 22 }, { l: 'Chat', v: 18 }, { l: 'Other', v: 12 }] },
                { dept: 'Support',     segs: [{ l: 'Triage', v: 62 }, { l: 'RAG', v: 24 }, { l: 'Summarize', v: 10 }, { l: 'Other', v: 4 }] },
                { dept: 'Sales',       segs: [{ l: 'Research', v: 54 }, { l: 'Drafting', v: 28 }, { l: 'CRM', v: 14 }, { l: 'Other', v: 4 }] },
                { dept: 'Legal',       segs: [{ l: 'Review', v: 71 }, { l: 'Drafting', v: 18 }, { l: 'Search', v: 11 }] },
              ].map(row => (
                <div key={row.dept}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: t.text }}>{row.dept}</span>
                  </div>
                  <div style={{ display: 'flex', height: 16, borderRadius: 4, overflow: 'hidden', background: t.surfaceSunk }}>
                    {row.segs.map((s, i) => (
                      <div key={i} title={`${s.l} · ${s.v}%`} style={{
                        width: `${s.v}%`,
                        background: ['#0F3460','#3577BB','#8AB6E3','#DBE7F4'][i] || t.borderStrong,
                        fontSize: 9.5, color: i < 2 ? '#fff' : t.text, fontWeight: 600,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{s.v >= 12 ? s.l : ''}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card t={t} title="Notable signals">
            {[
              { kind: 'ok',   lbl: 'Legal adoption +41%',     desc: 'NDA Reviewer rollout drove 38 → 31 active users' },
              { kind: 'warn', lbl: 'Finance adoption −4%',    desc: 'Drop tied to invoice-ocr latency · investigate' },
              { kind: 'ok',   lbl: 'Product piloting agents', desc: 'product-help-bot doubled in 14d' },
              { kind: 'off',  lbl: 'People dept inactive',    desc: '0 runs last 7 days · Onboarding tool offline' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0', borderTop: i > 0 ? `1px solid ${t.border}` : 'none' }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 11,
                  background: Status[s.kind](t).bg, color: Status[s.kind](t).fg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><Icon name={s.kind === 'ok' ? 'check' : s.kind === 'warn' ? 'alert' : 'x'} size={11} stroke={2.4} /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: t.text }}>{s.lbl}</div>
                  <div style={{ fontSize: 11.5, color: t.textFaint }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </PageBody>
    </>
  );
}
// ── 11. Workflow ───────────────────────────────────────
export function MgrWorkflow({ t, go }) {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchFlows = () => {
    setLoading(true);
    fetch('http://localhost:3000/api/workflows')
      .then(r => r.json())
      .then(json => {
        if (json.success) setFlows(json.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFlows();
  }, []);

  const handleCreate = () => {
    const name = prompt('Flow Name:');
    if (!name) return;
    fetch('http://localhost:3000/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description: 'New automated governance flow',
        trigger: 'model_deployment',
        definition: [{ type: 'scan' }, { type: 'notify' }]
      })
    })
    .then(r => r.json())
    .then(json => {
      if (json.success) fetchFlows();
    });
  };

  return (
    <>
      <PageHeader t={t} title="Automated Workflows" subtitle="Rule-based actions and approval pipelines across your AI estate."
        actions={<Btn t={t} icon="plus" onClick={handleCreate}>New flow</Btn>} />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {loading ? (
            <div style={{ padding: 20, color: t.textMuted }}>Loading workflows...</div>
          ) : flows.map((f, i) => {
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
                    {steps.map((step, idx) => (
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
                      <Icon name="clock" size={13} style={{ color: t.accent }} />
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
          })}
        </div>
      </PageBody>
    </>
  );
}

const FlowStat = ({ t, label, value }) => (
  <div>
    <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, color: t.text, marginTop: 2 }}>{value}</div>
  </div>
);
