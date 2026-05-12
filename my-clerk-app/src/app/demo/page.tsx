"use client";
import React, { useState } from 'react';
import Image from 'next/image';

const Themes = {
  navy: {
    bg: '#F4F6FA',
    surface: '#FFFFFF',
    surfaceAlt: '#F0F2F7',
    surfaceSunk: '#E8ECF3',
    border: '#DDE2EC',
    borderStrong: '#C4CAD7',
    text: '#16213E',
    textMuted: '#5A6479',
    textFaint: '#8A92A3',
    accent: '#0F3460',
    accentSoft: '#DDE5F2',
    accentText: '#FFFFFF',
    success: '#2ECC71',
    successSoft: '#E0F7EA',
    successText: '#1B7A40',
    warn: '#F39C12',
    warnSoft: '#FCEBCB',
    warnText: '#8A560A',
    danger: '#E74C3C',
    dangerSoft: '#FBE0DC',
    dangerText: '#962C20',
    chip: '#EEF1F7',
    radiusSm: 4,
    radiusMd: 6,
    radiusLg: 8,
  }
};

const NAVS: any = {
  manager: {
    title: 'AI Manager',
    subtitle: 'Governance · ML Platform',
    sections: [
      { title: 'Governance', items: [
        { id: 'overview', label: 'Overview', icon: 'grid' },
        { id: 'users', label: 'User management', icon: 'users' },
        { id: 'policies', label: 'Policies', icon: 'shield' },
        { id: 'analytics', label: 'Analytics', icon: 'chart' },
        { id: 'violations', label: 'Violations', icon: 'alert', badge: '3' },
      ]},
      { title: 'Assets', items: [
        { id: 'models', label: 'Model Registry', icon: 'cpu' },
        { id: 'knowledge', label: 'Knowledge Library', icon: 'book' },
        { id: 'settings', label: 'AI Settings', icon: 'settings' },
      ]},
    ],
  },
  finance: {
    title: 'Finance',
    subtitle: 'AI Spend & ROI',
    sections: [
      { title: 'Spend', items: [
        { id: 'dashboard', label: 'Spend dashboard', icon: 'coin' },
        { id: 'analysis', label: 'Cost analysis', icon: 'chart' },
      ]},
      { title: 'Value', items: [
        { id: 'roi', label: 'ROI dashboard', icon: 'target' },
        { id: 'usage', label: 'Usage & Analytics', icon: 'chart' },
        { id: 'budgets', label: 'Budget controls', icon: 'lock' },
      ]},
    ],
  },
  workspace: {
    title: 'Workspace',
    subtitle: 'Build & use AI tools',
    sections: [
      { title: 'Discover', items: [
        { id: 'tools', label: 'Tool gallery', icon: 'grid' },
        { id: 'registry', label: 'Agent Registry', icon: 'users' },
        { id: 'mytools', label: 'My tools', icon: 'star' },
      ]},
      { title: 'Knowledge', items: [
        { id: 'knowledge', label: 'My Knowledge', icon: 'book' },
      ]},
      { title: 'Builders', items: [
        { id: 'builder', label: 'Agent Builder', icon: 'flow' },
        { id: 'toolbuilder', label: 'Tool Builder', icon: 'zap' },
      ]},
    ],
  }
};

function Icon({ name, size = 16 }: any) {
  const icons: any = {
    grid: 'M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z',
    shield: 'M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3z',
    chart: 'M3 17V3M3 17h14M7 13V9M11 13V6M15 13v-3',
    users: 'M7 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM2.5 16c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4M13 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17.5 15c0-2-1.5-3.5-4-3.5',
    alert: 'M10 2l8 14H2L10 2zM10 8v4M10 14v0',
    cpu: 'M5 5h10v10H5zM8 2v3M12 2v3M8 15v3M12 15v3M2 8h3M2 12h3M15 8h3M15 12h3M8 8h4v4H8z',
    book: 'M4 4h6a2 2 0 0 1 2 2v10a2 2 0 0 0-2-2H4V4zM16 4h-4a2 2 0 0 0-2 2v8a2 2 0 0 1 2-2h4V4z',
    settings: 'M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM10 2v2M10 16v2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4',
    coin: 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM10 6v8M7.5 8.5h3.5a1.5 1.5 0 1 1 0 3H9',
    target: 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    star: 'M10 2l2.5 5.5L18 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L10 2z',
    flow: 'M4 4h4v4H4zM12 4h4v4h-4zM4 12h4v4H4zM12 12h4v4h-4zM8 6h4M6 8v4M14 8v4',
    lock: 'M5 9h10v8H5zM7 9V7a3 3 0 1 1 6 0v2M10 13v2',
    zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8Z',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={icons[name] || icons.grid} />
    </svg>
  );
}

export default function DemoPage() {
  const t = Themes.navy;
  const [persona, setPersona] = useState<'manager' | 'finance' | 'workspace'>('finance');
  const [activePage, setActivePage] = useState('dashboard');

  const nav = NAVS[persona];

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      padding: 16,
      background: '#111318',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: t.bg,
        color: t.text,
        overflow: 'hidden',
        borderRadius: 12,
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Title Bar */}
        <div style={{
          height: 44,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          background: t.surfaceSunk,
          borderBottom: `1px solid ${t.border}`,
          gap: 20,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              background: t.accent,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
            }}>A</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Atlas</div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 6, padding: 2, gap: 1 }}>
            {(['manager', 'finance', 'workspace'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPersona(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  background: persona === p ? t.accentSoft : 'transparent',
                  color: persona === p ? t.accent : t.textMuted,
                  fontSize: 12,
                  fontWeight: persona === p ? 600 : 500,
                }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ width: 40, textAlign: 'center', fontSize: 18 }}>👤</div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Sidebar */}
          <aside style={{
            width: 224,
            background: t.surfaceAlt,
            borderRight: `1px solid ${t.border}`,
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            padding: '14px 10px',
            gap: 2,
            overflowY: 'auto',
          }}>
            <div style={{ padding: '4px 8px 12px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{nav.title}</div>
              <div style={{ fontSize: 11.5, color: t.textFaint, marginTop: 1 }}>{nav.subtitle}</div>
            </div>

            {nav.sections.map((sec: any, si: number) => (
              <div key={si}>
                <div style={{ padding: '12px 8px 4px', fontSize: 10.5, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: t.textFaint }}>
                  {sec.title}
                </div>
                {sec.items.map((it: any) => (
                  <button
                    key={it.id}
                    onClick={() => setActivePage(it.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      padding: '6px 9px',
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                      background: activePage === it.id ? t.surface : 'transparent',
                      color: activePage === it.id ? t.text : t.textMuted,
                      fontSize: 13,
                      fontWeight: activePage === it.id ? 600 : 500,
                      textAlign: 'left',
                      boxShadow: activePage === it.id ? `0 0 0 1px ${t.border}` : 'none',
                    }}>
                    <span style={{ color: activePage === it.id ? t.accent : t.textFaint, display: 'flex' }}>
                      <Icon name={it.icon} size={15} />
                    </span>
                    <span style={{ flex: 1 }}>{it.label}</span>
                    {it.badge && (
                      <span style={{
                        fontSize: 10.5,
                        color: '#962C20',
                        background: '#FBE0DC',
                        padding: '0 6px',
                        borderRadius: 8,
                        fontWeight: 600,
                        minWidth: 18,
                        textAlign: 'center',
                      }}>{it.badge}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </aside>

          {/* Main Content Area */}
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {persona === 'finance' && <FinancePage t={t} />}
            {persona === 'manager' && <ManagerPage t={t} />}
            {persona === 'workspace' && <WorkspacePage t={t} />}
          </main>
        </div>
      </div>
    </div>
  );
}

function FinancePage({ t }: any) {
  return (
    <>
      <div style={{ padding: '20px 28px 16px', borderBottom: `1px solid ${t.border}`, background: t.surface, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: t.text, margin: 0, letterSpacing: -0.4 }}>Finance Dashboard</h1>
            <div style={{ fontSize: 13, color: t.textMuted, marginTop: 3 }}>$24.5K MTD · projecting $32.6K end of month</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, border: `1px solid ${t.border}`, background: t.surface, borderRadius: 6, cursor: 'pointer', color: t.textMuted }}>📅 Current Month</button>
            <button style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, border: `1px solid ${t.border}`, background: t.surface, borderRadius: 6, cursor: 'pointer', color: t.textMuted }}>⬇️ Export</button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: t.bg }}>
        <div style={{ padding: '20px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
            {[
              { label: 'Spend MTD', value: '$24.5K', delta: '+24%', deltaKind: 'down', sub: 'vs same time last month' },
              { label: 'Projected EOM', value: '$32.6K', delta: '+18%', deltaKind: 'down', sub: 'vs budget' },
              { label: 'Cost / 1K req', value: '$0.42', delta: '−$0.08', deltaKind: 'up', sub: 'optimizations live' },
              { label: 'Active models', value: '5', sub: 'within compliance' }
            ].map((stat, i) => (
              <div key={i} style={{
                background: t.surface,
                padding: 16,
                borderRadius: 8,
                border: `1px solid ${t.border}`
              }}>
                <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 600, marginBottom: 8 }}>{stat.label}</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: t.text, marginBottom: 8 }}>{stat.value}</div>
                {stat.delta && <div style={{ fontSize: 12, color: stat.deltaKind === 'down' ? '#2ECC71' : '#E74C3C', fontWeight: 600 }}>{stat.delta} {stat.deltaKind === 'down' ? '↓' : '↑'}</div>}
                {stat.sub && <div style={{ fontSize: 11, color: t.textMuted, marginTop: 8 }}>{stat.sub}</div>}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginBottom: 14 }}>
            <div style={{
              background: t.surface,
              padding: 20,
              borderRadius: 8,
              border: `1px solid ${t.border}`
            }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: '0 0 16px', letterSpacing: -0.2 }}>Spend over time</h3>
              <div style={{ height: 200, background: t.bg, borderRadius: 6, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: 16 }}>
                {[45, 52, 48, 65, 72, 68, 75, 82, 78, 85, 90, 88].map((h, i) => (
                  <div key={i} style={{
                    width: 20,
                    height: `${h * 1.5}px`,
                    background: `linear-gradient(180deg, #0F3460 0%, #1E6B96 100%)`,
                    borderRadius: 3,
                    opacity: 0.8
                  }} />
                ))}
              </div>
            </div>

            <div style={{
              background: t.surface,
              padding: 20,
              borderRadius: 8,
              border: `1px solid ${t.border}`
            }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: '0 0 16px', letterSpacing: -0.2 }}>Spend by provider</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  { name: 'OpenAI', pct: 42, color: '#0F3460' },
                  { name: 'Anthropic', pct: 29, color: '#1E6B96' },
                  { name: 'Google', pct: 20, color: '#2D8FBA' },
                  { name: 'Other', pct: 9, color: '#7EB3D4' }
                ].map((p, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, color: t.textMuted }}><span>{p.name}</span><span>{p.pct}%</span></div>
                    <div style={{ width: '100%', height: 6, background: t.bg, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${p.pct}%`, height: '100%', background: p.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            background: t.surface,
            borderRadius: 8,
            border: `1px solid ${t.border}`,
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border}`, fontSize: 13, fontWeight: 600, color: t.text }}>Department Budgets</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
              {[
                { dept: 'Engineering', used: '$8.4K', limit: '$10K', pct: 84 },
                { dept: 'Marketing', used: '$5.1K', limit: '$6K', pct: 85 },
                { dept: 'Finance', used: '$4.2K', limit: '$8K', pct: 53 },
                { dept: 'Sales', used: '$6.8K', limit: '$7K', pct: 97 }
              ].map((b, i) => (
                <div key={i} style={{
                  padding: 16,
                  borderRight: i < 3 ? `1px solid ${t.border}` : 'none'
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 8 }}>{b.dept}</div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 4 }}>{b.used} of {b.limit}</div>
                  <div style={{ width: '100%', height: 6, background: t.bg, borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{
                      width: `${Math.min(b.pct, 100)}%`,
                      height: '100%',
                      background: b.pct > 90 ? '#E74C3C' : '#2ECC71'
                    }} />
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: b.pct > 90 ? '#962C20' : '#1B7A40', background: b.pct > 90 ? '#FBE0DC' : '#E0F7EA', padding: '2px 6px', borderRadius: 4, textAlign: 'center' }}>{b.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ManagerPage({ t }: any) {
  return (
    <>
      <div style={{ padding: '20px 28px 16px', borderBottom: `1px solid ${t.border}`, background: t.surface, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: t.text, margin: 0, letterSpacing: -0.4 }}>Governance Overview</h1>
            <div style={{ fontSize: 13, color: t.textMuted, marginTop: 3 }}>8 active policies · 3 open violations · 24 models tracked</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: t.bg }}>
        <div style={{ padding: '20px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
            {[
              { label: 'Active Policies', value: '8', color: '#0F3460' },
              { label: 'Open Violations', value: '3', color: '#E74C3C' },
              { label: 'Remediated', value: '12', color: '#2ECC71' },
              { label: 'Models Tracked', value: '24', color: '#0284c7' }
            ].map((stat, i) => (
              <div key={i} style={{
                background: t.surface,
                padding: 16,
                borderRadius: 8,
                border: `2px solid ${stat.color}33`,
                borderLeft: `4px solid ${stat.color}`
              }}>
                <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 600, marginBottom: 8 }}>{stat.label}</div>
                <div style={{ fontSize: 28, fontWeight: 600, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: t.surface,
            borderRadius: 8,
            border: `1px solid ${t.border}`,
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border}`, fontSize: 13, fontWeight: 600, color: t.text }}>Recent Violations</div>
            <div>
              {[
                { policy: 'PII Detection', model: 'gpt-4o-fine-tuned', severity: 'critical', time: '2 hours ago' },
                { policy: 'Keyword Filtering', model: 'claude-3-sonnet', severity: 'warning', time: '4 hours ago' },
                { policy: 'Budget Limit', model: 'gemini-pro', severity: 'critical', time: '6 hours ago' }
              ].map((v, i) => (
                <div key={i} style={{
                  padding: 16,
                  borderBottom: i < 2 ? `1px solid ${t.border}` : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 4 }}>{v.policy}</div>
                    <div style={{ fontSize: 11, color: t.textMuted }}>{v.model} · {v.time}</div>
                  </div>
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: v.severity === 'critical' ? '#962C20' : '#8A560A',
                    background: v.severity === 'critical' ? '#FBE0DC' : '#FCEBCB',
                    padding: '4px 10px',
                    borderRadius: 6
                  }}>{v.severity.charAt(0).toUpperCase() + v.severity.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function WorkspacePage({ t }: any) {
  return (
    <>
      <div style={{ padding: '20px 28px 16px', borderBottom: `1px solid ${t.border}`, background: t.surface, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: t.text, margin: 0, letterSpacing: -0.4 }}>Tool Gallery</h1>
            <div style={{ fontSize: 13, color: t.textMuted, marginTop: 3 }}>Discover & manage tools and agents</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: t.bg }}>
        <div style={{ padding: '20px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Available Tools', value: '18' },
              { label: 'My Agents', value: '3' },
              { label: 'Knowledge Bases', value: '12' },
              { label: 'Workflows', value: '7' }
            ].map((stat, i) => (
              <div key={i} style={{
                background: t.surface,
                padding: 16,
                borderRadius: 8,
                border: `1px solid ${t.border}`
              }}>
                <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 600, marginBottom: 8 }}>{stat.label}</div>
                <div style={{ fontSize: 28, fontWeight: 600, color: t.accent }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: '0 0 12px', letterSpacing: -0.2 }}>Available Tools</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 24 }}>
            {['📧 Email', '💬 Slack', '🗄️ Database', '🕷️ Scraper', '📄 PDF', '🔌 API'].map((tool, i) => (
              <div key={i} style={{
                background: t.surface,
                padding: 16,
                borderRadius: 8,
                border: `1px solid ${t.border}`,
                textAlign: 'center',
                cursor: 'pointer'
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{tool.split(' ')[0]}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: t.text }}>{tool.split(' ')[1]}</div>
                <div style={{ fontSize: 10, color: t.success, marginTop: 8 }}>✓ Ready</div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: '0 0 12px', letterSpacing: -0.2 }}>My Agents</h3>
          <div style={{
            background: t.surface,
            borderRadius: 8,
            border: `1px solid ${t.border}`,
            overflow: 'hidden'
          }}>
            {[
              { name: 'Customer Support Bot', status: 'Active', users: 142 },
              { name: 'Data Analysis Agent', status: 'Draft', users: 8 },
              { name: 'Sales Research', status: 'Active', users: 34 }
            ].map((agent, i) => (
              <div key={i} style={{
                padding: 16,
                borderBottom: i < 2 ? `1px solid ${t.border}` : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 4 }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: t.textMuted }}>{agent.users} users</div>
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: agent.status === 'Active' ? '#1B7A40' : t.textMuted,
                  background: agent.status === 'Active' ? '#E0F7EA' : t.chip,
                  padding: '4px 10px',
                  borderRadius: 6
                }}>{agent.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
