import React, { useEffect, useState } from 'react';
import { Card, Stat, StatusPill, Icon, Avatar, Btn, Sparkline, ProviderMark } from './system';
import { PageHeader, PageBody } from './Shell';

// ── 1. Spend Dashboard ──────────────────────────────────
export function CfoSpend({ t, go }) {
  return (
    <>
      <PageHeader t={t} title="Finance Dashboard" subtitle="$111.5K MTD · projecting $186K end of month"
        actions={<>
          <Btn t={t} kind="secondary" icon="filter">May 2024</Btn>
          <Btn t={t} kind="secondary" icon="download">Export</Btn>
        </>}/>
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 14 }}>
          <Card t={t}><Stat t={t} label="Spend MTD" value="$111.5K" delta="+24%" deltaKind="down" sub="vs same time last month" /></Card>
          <Card t={t}><Stat t={t} label="Projected EOM" value="$186K" delta="+18%" deltaKind="down" sub="$24K over budget" /></Card>
          <Card t={t}><Stat t={t} label="Cost / 1K req" value="$0.42" delta="−$0.08" deltaKind="up" sub="optimizations live" /></Card>
          <Card t={t}><Stat t={t} label="Active models" value="127" sub="14 unbudgeted" /></Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginBottom: 14 }}>
          <Card t={t} title="Spend over time" subtitle="Daily, last 30 days · vs budget" action={<Btn t={t} kind="ghost" size="sm" onClick={() => go('c-analysis')}>Analyze →</Btn>}>
            <SpendChart t={t} />
          </Card>

          <Card t={t} title="By provider" subtitle="$111.5K total" padding={0}>
            {[
              { name: 'OpenAI',     spend: 42400, share: 38, trend: '+12%', color: '#10A37F' },
              { name: 'Anthropic',  spend: 31200, share: 28, trend: '+34%', color: '#D97757' },
              { name: 'Google',     spend: 18700, share: 17, trend: '+8%',  color: '#4285F4' },
              { name: 'AWS Bedrock',spend: 11400, share: 10, trend: '+5%',  color: '#FF9900' },
              { name: 'On-prem',    spend: 7800,  share:  7, trend: '−3%',  color: '#7B61FF' },
            ].map((p,i) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 16px', borderTop: i > 0 ? `1px solid ${t.border}` : 'none' }}>
                <ProviderMark seed={p.name} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: t.text }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: p.trend.startsWith('−') ? t.successText : t.dangerText, fontWeight: 600 }}>{p.trend}</span>
                  </div>
                  <div style={{ height: 4, background: t.surfaceSunk, borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                    <div style={{ width: p.share * 2 + '%', height: '100%', background: p.color }} />
                  </div>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: t.text, fontFamily: 'ui-monospace, monospace' }}>${(p.spend/1000).toFixed(1)}K</div>
              </div>
            ))}
          </Card>
        </div>
      </PageBody>
    </>
  );
}

function SpendChart({ t }) {
  const days = 30;
  const data = Array.from({ length: days }, (_, i) => 2.5 + i * 0.13 + Math.sin(i/3) * 0.6);
  const budget = 4.5;
  const max = Math.max(...data, budget) * 1.1;
  const w = 600, h = 160;
  const pts = data.map((v, i) => `${(i/(days-1)) * w},${h - (v/max) * (h-12) - 6}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: 'block' }}>
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1="0" x2={w} y1={h*p} y2={h*p} stroke={t.border} strokeDasharray="2,4" />
      ))}
      <line x1="0" x2={w} y1={h - (budget/max)*(h-12) - 6} y2={h - (budget/max)*(h-12) - 6}
        stroke={t.danger} strokeWidth="1.2" strokeDasharray="4,3" />
      <text x={w-4} y={h - (budget/max)*(h-12) - 9} textAnchor="end" fill={t.dangerText} fontSize="9" fontWeight="600">BUDGET $4.5K/day</text>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={t.accent} opacity="0.13" />
      <polyline points={pts} fill="none" stroke={t.accent} strokeWidth="2" />
    </svg>
  );
}

// ── 2. Cost Analysis ────────────────────────────────────
export function CfoAnalysis({ t, go }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/spend/analysis')
      .then(r => r.json())
      .then(json => {
        if (json.success) setData(json.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <PageHeader t={t} title="Cost Analysis" subtitle="Deep dive into spend by provider and model"
        actions={<Btn t={t} kind="secondary" onClick={() => go('c-spend')}>Back to Dashboard</Btn>} />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
          <Card t={t} title="Spend by Provider" padding={0}>
            {loading ? <div style={{ padding: 20, color: t.textMuted }}>Loading analysis...</div> : (
              data.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: i > 0 ? `1px solid ${t.border}` : 'none' }}>
                  <ProviderMark seed={item.provider} size={28} />
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: t.text }}>{item.provider}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text, fontFamily: 'ui-monospace, monospace' }}>${item.total.toLocaleString()}</div>
                </div>
              ))
            )}
          </Card>
          <Card t={t} title="Insights">
            <div style={{ fontSize: 12.5, color: t.textMuted, lineHeight: 1.6 }}>
              OpenAI spend is up 12% due to increased usage in the <strong>Support Router</strong> model. 
              Consider switching to a fine-tuned GPT-3.5 or an on-prem alternative to reduce costs.
            </div>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

// ── 3. ROI Dashboard ────────────────────────────────────
export function CfoRoi({ t, go }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/roi')
      .then(r => r.json())
      .then(json => {
        if (json.success) setData(json.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <PageHeader t={t} title="Investment & ROI" subtitle="Tracking value delivered by AI projects" />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {loading ? <div style={{ color: t.textMuted }}>Loading ROI data...</div> : (
            data.map((item, idx) => (
              <Card key={idx} t={t} title={item.name} subtitle={item.team}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: t.textFaint }}>INVESTED</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>${item.invested.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: t.textFaint }}>EST. VALUE</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.successText }}>${item.value.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: `1px dashed ${t.border}` }}>
                    <span style={{ fontSize: 12, color: t.textFaint }}>ROI</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: t.accent }}>{item.roi}</span>
                  </div>
                  <StatusPill t={t} kind="ok" label={item.status} />
                </div>
              </Card>
            ))
          )}
        </div>
      </PageBody>
    </>
  );
}

// ── 4. Forecasts ────────────────────────────────────────
export function CfoForecast({ t, go }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/forecast')
      .then(r => r.json())
      .then(json => {
        if (json.success) setData(json.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <PageHeader t={t} title="Spend Forecasts" subtitle="AI spend projections based on current growth" />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {loading ? <div style={{ color: t.textMuted }}>Loading forecasts...</div> : (
            data.map((item, idx) => (
              <Card key={idx} t={t} title={item.name} subtitle={item.total} padding={16} action={item.selected && <StatusPill t={t} kind="ok" label="Current" />}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: t.textFaint, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Growth Delta</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: item.delta.startsWith('+') ? t.dangerText : t.successText }}>{item.delta}</div>
                    <div style={{ fontSize: 12.5, color: t.textMuted, marginTop: 8, lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                  <div style={{ width: 100 }}>
                    <Sparkline t={t} data={[10, 12, 15, 14, 18, 22, 25]} height={50} color={item.delta.startsWith('+') ? t.danger : t.success} />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </PageBody>
    </>
  );
}

// ── 5. Budgets ──────────────────────────────────────────
export function CfoBudgets({ t, go }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/budgets')
      .then(r => r.json())
      .then(json => {
        if (json.success) setData(json.data.budgets);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <PageHeader t={t} title="Budget Allocations" subtitle="Monthly limits and alert thresholds by department" />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {loading ? <div style={{ color: t.textMuted }}>Loading budgets...</div> : (
            data.map((item, idx) => (
              <Card key={idx} t={t} title={item.name} padding={16}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Monthly Limit</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>${item.monthlyLimit.toLocaleString()}</div>
                  </div>
                  <div style={{ height: 6, background: t.surfaceSunk, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '65%', height: '100%', background: t.accent }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: t.textMuted }}>
                    <span>Threshold: {item.alertThreshold * 100}%</span>
                    <span>Spent: 65%</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </PageBody>
    </>
  );
}

// ── 6. Reports ──────────────────────────────────────────
export function CfoReports({ t, go }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/reports')
      .then(r => r.json())
      .then(json => {
        if (json.success) setData(json.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <PageHeader t={t} title="Financial Reports" subtitle="Scheduled and generated spend summaries"
        actions={<Btn t={t} icon="plus">Schedule Report</Btn>} />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
          {loading ? <div style={{ color: t.textMuted }}>Loading reports...</div> : (
            data.map((item, idx) => (
              <Card key={idx} t={t} padding={0}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: t.radiusMd, background: t.accentSoft, color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="doc" size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: t.textFaint }}>Schedule: {item.schedule}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: t.textMuted }}>Next run</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: t.text }}>{item.nextRun}</div>
                  </div>
                  <Btn t={t} kind="ghost" icon="download" />
                </div>
              </Card>
            ))
          )}
        </div>
      </PageBody>
    </>
  );
}
