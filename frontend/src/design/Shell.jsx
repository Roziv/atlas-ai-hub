import React from 'react';
import { Icon, Avatar } from './system';

export const NAVS = {
  manager: {
    title: 'AI Manager',
    subtitle: 'Governance · ML Platform',
    user: { name: 'Ziv', role: 'VP, AI Platform' },
    sections: [
      { title: 'Overview', items: [
        { id: 'm-dashboard',  label: 'Dashboard',     icon: 'home' },
        { id: 'm-analytics',  label: 'Analytics',     icon: 'chart' },
        { id: 'm-dept-report', label: 'By department', icon: 'users' },
      ]},
      { title: 'Governance', items: [
        { id: 'm-violations', label: 'Violations',    icon: 'alert', badge: '3' },
        { id: 'm-policies',   label: 'Policy library', icon: 'shield' },
        { id: 'm-workflow',   label: 'Workflow',      icon: 'flow' },
      ]},
      { title: 'Assets', items: [
        { id: 'm-models',     label: 'Model registry', icon: 'cpu' },
        { id: 'm-rag',        label: 'RAG library',    icon: 'book' },
      ]},
    ],
  },
  cfo: {
    title: 'Finance',
    subtitle: 'AI Spend & ROI',
    user: { name: 'Marcus Chen', role: 'CFO' },
    sections: [
      { title: 'Spend', items: [
        { id: 'c-spend',      label: 'Spend dashboard', icon: 'coin' },
        { id: 'c-analysis',   label: 'Cost analysis',   icon: 'chart' },
        { id: 'c-forecast',   label: 'Forecasting',     icon: 'arrowU' },
      ]},
      { title: 'Value', items: [
        { id: 'c-roi',        label: 'ROI dashboard',   icon: 'target' },
        { id: 'c-budgets',    label: 'Budget controls', icon: 'lock' },
        { id: 'c-reports',    label: 'Reports',         icon: 'doc' },
      ]},
    ],
  },
  user: {
    title: 'Workspace',
    subtitle: 'Build & use AI tools',
    user: { name: 'Priya Shah', role: 'Business Analyst, Legal' },
    sections: [
      { title: 'Discover', items: [
        { id: 'u-gallery',    label: 'Tool gallery',    icon: 'grid' },
        { id: 'u-mine',       label: 'My tools',        icon: 'star' },
        { id: 'u-skills',     label: 'Skills',          icon: 'spark' },
      ]},
      { title: 'Knowledge', items: [
        { id: 'u-rag',        label: 'My knowledge',    icon: 'book' },
      ]},
      { title: 'Build', items: [
        { id: 'u-builder',    label: 'Agent builder',   icon: 'flow' },
      ]},
    ],
  },
};

export function Shell({ t, persona, setPersona, current, setCurrent, children }) {
  const nav = NAVS[persona];
  return (
    <div style={{
      width: '100vw', height: '100vh', padding: 16, background: '#111318', // Deeper dark desk background
      display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: t.bg, color: t.text, overflow: 'hidden', borderRadius: 12,
        boxShadow: `0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)`,
        fontFamily: '"Inter", system-ui, sans-serif', fontSize: 13.5,
      }}>
        <TitleBar t={t} persona={persona} setPersona={setPersona} />
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <Sidebar t={t} nav={nav} current={current} setCurrent={setCurrent} />
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function TitleBar({ t, persona, setPersona }) {
  const personas = [
    { id: 'manager', label: 'Manager', icon: 'shield' },
    { id: 'cfo',     label: 'Finance', icon: 'coin' },
    { id: 'user',    label: 'Workspace', icon: 'flow' },
  ];
  return (
    <div style={{
      height: 44, display: 'flex', alignItems: 'center', padding: '0 16px',
      background: t.surfaceSunk, borderBottom: `1px solid ${t.border}`, gap: 20, flexShrink: 0,
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 5, background: t.accent, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
        }}>A</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Atlas</div>
        <div style={{ fontSize: 12, color: t.textFaint }}>· Acme Corp</div>
      </div>

      <div style={{ display: 'flex', background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.radiusMd, padding: 2, gap: 1 }}>
        {personas.map(p => (
          <button key={p.id} onClick={() => setPersona && setPersona(p.id)} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: t.radiusSm, border: 'none', cursor: 'pointer',
            background: persona === p.id ? t.accentSoft : 'transparent',
            color: persona === p.id ? t.accentText : t.textMuted,
            fontSize: 12, fontWeight: persona === p.id ? 600 : 500, fontFamily: 'inherit',
          }}>
            <Icon name={p.icon} size={12} /> {p.label}
          </button>
        ))}
      </div>

      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>
        <Avatar name={NAVS[persona].user.name} size={28} />
      </div>
    </div>
  );
}

function Sidebar({ t, nav, current, setCurrent }) {
  return (
    <aside style={{
      width: 224, background: t.surfaceAlt, borderRight: `1px solid ${t.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      padding: '14px 10px', gap: 2,
    }}>
      <div style={{ padding: '4px 8px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{nav.title}</div>
        <div style={{ fontSize: 11.5, color: t.textFaint, marginTop: 1 }}>{nav.subtitle}</div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 7, padding: '6px 9px',
        background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.radiusMd,
        color: t.textFaint, marginBottom: 10,
      }}>
        <Icon name="search" size={13} />
        <span style={{ flex: 1, fontSize: 12 }}>Search…</span>
        <span style={{ fontSize: 10.5, padding: '1px 5px', borderRadius: 3, background: t.chip, color: t.textMuted, fontFamily: 'ui-monospace, monospace' }}>⌘K</span>
      </div>

      {nav.sections.map((sec, si) => (
        <React.Fragment key={si}>
          <div style={{ padding: '12px 8px 4px', fontSize: 10.5, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: t.textFaint }}>
            {sec.title}
          </div>
          {sec.items.map(it => (
            <NavRow key={it.id} t={t} active={current === it.id} onClick={() => setCurrent && setCurrent(it.id)} {...it} />
          ))}
        </React.Fragment>
      ))}

      <div style={{ flex: 1 }} />
      <div style={{
        display: 'flex', alignItems: 'center', gap: 9, padding: 8,
        borderRadius: t.radiusMd, background: t.surface, border: `1px solid ${t.border}`,
      }}>
        <Avatar name={nav.user.name} size={26} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: t.text, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nav.user.name}</div>
          <div style={{ fontSize: 10.5, color: t.textFaint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nav.user.role}</div>
        </div>
        <Icon name="settings" size={13} style={{ color: t.textFaint }} />
      </div>
    </aside>
  );
}

function NavRow({ t, active, onClick, icon, label, badge }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '6px 9px', borderRadius: t.radiusMd, border: 'none', cursor: 'pointer',
      background: active ? t.surface : 'transparent',
      color: active ? t.text : t.textMuted,
      fontSize: 13, fontWeight: active ? 600 : 500, textAlign: 'left',
      fontFamily: 'inherit', width: '100%',
      boxShadow: active ? `0 0 0 1px ${t.border}, 0 1px 2px rgba(0,0,0,.03)` : 'none',
    }}>
      <span style={{ color: active ? t.accent : t.textFaint, display: 'flex' }}>
        <Icon name={icon} size={15} />
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{
          fontSize: 10.5, color: t.dangerText, background: t.dangerSoft,
          padding: '0 6px', borderRadius: 8, fontWeight: 600, minWidth: 18, textAlign: 'center',
        }}>{badge}</span>
      )}
    </button>
  );
}

export function PageHeader({ t, breadcrumb, title, subtitle, actions }) {
  return (
    <div style={{ padding: '20px 28px 16px', borderBottom: `1px solid ${t.border}`, background: t.surface, flexShrink: 0 }}>
      {breadcrumb && (
        <div style={{ fontSize: 11.5, color: t.textFaint, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
          {breadcrumb.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Icon name="chevR" size={10} />}
              <span style={{ color: i === breadcrumb.length - 1 ? t.textMuted : t.textFaint }}>{b}</span>
            </React.Fragment>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: t.text, margin: 0, letterSpacing: -0.4 }}>{title}</h1>
          {subtitle && <div style={{ fontSize: 13, color: t.textMuted, marginTop: 3 }}>{subtitle}</div>}
        </div>
        {actions}
      </div>
    </div>
  );
}

export const PageBody = ({ children, padding = '20px 28px 28px', t }) => (
  <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: t.bg }}>
    <div style={{ padding }}>{children}</div>
  </div>
);
