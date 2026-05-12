"use client";
import React from 'react';
import { Themes, Icon, Avatar } from './System';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';

export const NAVS: any = {
  manager: {
    title: 'AI Manager',
    subtitle: 'Governance · ML Platform',
    sections: [
      { title: 'Governance', items: [
        { id: '/dashboard/manager',    label: 'Overview',        icon: 'grid' },
        { id: '/dashboard/manager/users', label: 'User management', icon: 'flow' },
        { id: '/dashboard/policies',   label: 'Policies',      icon: 'shield' },
        { id: '/dashboard/analytics',  label: 'Analytics',       icon: 'chart' },
        { id: '/dashboard/violations', label: 'Violations',    icon: 'alert', badge: '3' },
        { id: '/dashboard/workflow',   label: 'Workflow',      icon: 'flow' },
      ]},
      { title: 'Assets', items: [
        { id: '/dashboard/models',     label: 'Model Registry', icon: 'cpu' },
        { id: '/dashboard/manager/knowledge',  label: 'Knowledge Library', icon: 'book' },
        { id: '/dashboard/manager/ai-settings', label: 'AI Settings', icon: 'gear' },
      ]},
    ],
  },
  finance: {
    title: 'Finance',
    subtitle: 'AI Spend & ROI',
    sections: [
      { title: 'Spend', items: [
        { id: '/dashboard/finance',           label: 'Spend dashboard', icon: 'coin' },
        { id: '/dashboard/finance/analytics', label: 'Cost analysis',   icon: 'chart' },
      ]},
      { title: 'Value', items: [
        { id: '/dashboard/roi',             label: 'ROI dashboard',   icon: 'target' },
        { id: '/dashboard/finance/usage',   label: 'Usage & Analytics', icon: 'chart' },
        { id: '/dashboard/budgets',         label: 'Budget controls', icon: 'lock' },
      ]},
    ],
  },
  workspace: {
    title: 'Workspace',
    subtitle: 'Build & use AI tools',
    sections: [
      { title: 'Discover', items: [
        { id: '/dashboard/workspace',    label: 'Tool gallery',    icon: 'grid' },
        { id: '/dashboard/workspace/registry', label: 'Agent Registry', icon: 'bot' },
        { id: '/dashboard/my-tools',       label: 'My tools',        icon: 'star' },
      ]},
      { title: 'Knowledge', items: [
        { id: '/dashboard/knowledge',    label: 'My Knowledge',    icon: 'book' },
      ]},
      { title: 'Builders', items: [
        { id: '/dashboard/builder',      label: 'Agent Builder',   icon: 'flow' },
        { id: '/dashboard/tools/builder', label: 'Tool Builder',    icon: 'zap' },
      ]},
      { title: 'System', items: [
        { id: '/dashboard/settings',     label: 'Settings',        icon: 'gear' },
      ]},
    ],
  }
};

export function DashboardShell({ children, persona = 'manager' }: { children: React.ReactNode, persona?: string }) {
  const t = Themes.navy;
  const { user } = useUser();
  const pathname = usePathname();

  // Role-based access control
  const role = (user?.publicMetadata?.role as string) || 'end_user';
  
  const allowed = {
    ai_manager: ['manager', 'finance', 'workspace'],
    cfo:        ['finance', 'workspace'],
    end_user:   ['workspace'],
  }[role] || ['workspace'];

  // If trying to access a persona not allowed, we don't handle redirect here (it's a client component)
  // but we can hide the UI or show a 403 state. 
  // For simplicity in this demo, if it's not in allowed, we show a restricted message.
  const isAllowed = allowed.includes(persona);

  const nav = NAVS[persona];

  return (
    <div style={{
      width: '100vw', height: '100vh', padding: 16, background: '#111318',
      display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: t.bg, color: t.text, overflow: 'hidden', borderRadius: 12,
        boxShadow: `0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)`,
        fontFamily: '"Inter", system-ui, sans-serif', fontSize: 13.5,
      }}>
        <TitleBar t={t} persona={persona} allowedPersonas={allowed} />
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <Sidebar t={t} nav={nav} current={pathname} />
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {!isAllowed ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <Icon name="shield" size={48} style={{ color: t.danger, marginBottom: 16, opacity: 0.5 }} />
                <h2 style={{ color: t.text }}>Access Restricted</h2>
                <p style={{ color: t.textMuted }}>Your current role ({role}) does not have permission to view the {persona} dashboard.</p>
                <Link href="/dashboard/workspace" style={{ color: t.accent, fontWeight: 600 }}>Back to Workspace</Link>
              </div>
            ) : children}
          </main>
        </div>
      </div>
    </div>
  );
}

function TitleBar({ t, persona, allowedPersonas }: { t: any, persona: string, allowedPersonas: string[] }) {
  const allPersonas = [
    { id: 'manager', label: 'Manager', icon: 'shield', path: '/dashboard/manager' },
    { id: 'finance',     label: 'Finance', icon: 'coin', path: '/dashboard/finance' },
    { id: 'workspace',    label: 'Workspace', icon: 'flow', path: '/dashboard/workspace' },
  ];

  const personas = allPersonas.filter(p => allowedPersonas.includes(p.id));
  return (
    <div style={{
      height: 44, display: 'flex', alignItems: 'center', padding: '0 16px',
      background: t.surfaceSunk, borderBottom: `1px solid ${t.border}`, gap: 20, flexShrink: 0,
    }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 5, background: t.accent, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
        }}>A</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Atlas</div>
      </Link>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.radiusMd, padding: 2, gap: 1 }}>
        {personas.map(p => (
          <Link key={p.id} href={p.path} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: t.radiusSm, cursor: 'pointer',
              background: persona === p.id ? t.accentSoft : 'transparent',
              color: persona === p.id ? t.accentText : t.textMuted,
              fontSize: 12, fontWeight: persona === p.id ? 600 : 500,
            }}>
              <Icon name={p.icon} size={12} /> {p.label}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>
        <UserButton />
      </div>
    </div>
  );
}

function Sidebar({ t, nav, current }: any) {
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

      {nav.sections.map((sec: any, si: number) => (
        <React.Fragment key={si}>
          <div style={{ padding: '12px 8px 4px', fontSize: 10.5, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: t.textFaint }}>
            {sec.title}
          </div>
          {sec.items.map((it: any) => (
            <Link key={it.id} href={it.id} style={{ textDecoration: 'none' }}>
              <NavRow t={t} active={current === it.id} {...it} />
            </Link>
          ))}
        </React.Fragment>
      ))}
    </aside>
  );
}

function NavRow({ t, active, icon, label, badge }: any) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '6px 9px', borderRadius: t.radiusMd, cursor: 'pointer',
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
          fontSize: 10.5, color: '#962C20', background: '#FBE0DC',
          padding: '0 6px', borderRadius: 8, fontWeight: 600, minWidth: 18, textAlign: 'center',
        }}>{badge}</span>
      )}
    </div>
  );
}

export function PageHeader({ t, title, subtitle, actions }: any) {
  return (
    <div style={{ padding: '20px 28px 16px', borderBottom: `1px solid ${t.border}`, background: t.surface, flexShrink: 0 }}>
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

export const PageBody = ({ children, padding = '20px 28px 28px', t }: any) => (
  <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: t.bg }}>
    <div style={{ padding }}>{children}</div>
  </div>
);
