"use client";
import React from 'react';

export const Themes = {
  navy: {
    id: 'navy', name: 'Enterprise (navy)',
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
    serif: '"Inter", system-ui, sans-serif',  
    radiusSm: 4, radiusMd: 6, radiusLg: 8,
  }
};

export const Status = {
  ok:    (t: any) => ({ bg: t.successSoft, fg: t.successText, dot: t.success, label: 'Healthy' }),
  warn:  (t: any) => ({ bg: t.warnSoft,    fg: t.warnText,    dot: t.warn,    label: 'Warning' }),
  bad:   (t: any) => ({ bg: t.dangerSoft,  fg: t.dangerText,  dot: t.danger,  label: 'Critical' }),
  off:   (t: any) => ({ bg: t.chip,        fg: t.textFaint,   dot: t.textFaint, label: 'Off' }),
};

export const StatusPill = ({ t, kind = 'ok', label, dot = true }: any) => {
  const statusFn = (Status as any)[kind] || Status.off;
  const s = statusFn(t);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 12,
      background: s.bg, color: s.fg, fontSize: 11.5, fontWeight: 600,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 3, background: s.dot }} />}
      {label || s.label}
    </span>
  );
};

export const Icon = ({ name, size = 16, stroke = 1.7, style }: any) => {
  const p: any = {
    home:      'M3 10.5L10 4l7 6.5M5 9.5V16h10V9.5',
    layers:    'M10 3l7 4-7 4-7-4 7-4zM3 11l7 4 7-4M3 14l7 4 7-4',
    shield:    'M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3z',
    book:      'M4 4h6a2 2 0 0 1 2 2v10a2 2 0 0 0-2-2H4V4zM16 4h-4a2 2 0 0 0-2 2v8a2 2 0 0 1 2-2h4V4z',
    chart:     'M3 17V3M3 17h14M7 13V9M11 13V6M15 13v-3',
    alert:     'M10 2l8 14H2L10 2zM10 8v4M10 14v0',
    check:     'M4 10l4 4 8-8',
    x:         'M5 5l10 10M15 5L5 15',
    plus:      'M10 4v12M4 10h12',
    chevR:     'M7 4l6 6-6 6',
    chevD:     'M5 8l5 5 5-5',
    chevL:     'M13 4l-6 6 6 6',
    search:    'M9 15A6 6 0 1 0 9 3a6 6 0 0 0 0 12zM13.5 13.5L17 17',
    settings:  'M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM10 2v2M10 16v2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4M2 10h2M16 10h2M4.9 15.1l1.4-1.4M13.7 6.3l1.4-1.4',
    bell:      'M5 14V9a5 5 0 0 1 10 0v5l2 2H3l2-2zM8 18h4',
    user:      'M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 17c0-3 3-5 6-5s6 2 6 5',
    users:     'M7 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM2.5 16c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4M13 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17.5 15c0-2-1.5-3.5-4-3.5',
    cpu:       'M5 5h10v10H5zM8 2v3M12 2v3M8 15v3M12 15v3M2 8h3M2 12h3M15 8h3M15 12h3M8 8h4v4H8z',
    coin:      'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM10 6v8M7.5 8.5h3.5a1.5 1.5 0 1 1 0 3H9a1.5 1.5 0 1 0 0 3h3.5',
    arrowU:    'M10 16V4M5 9l5-5 5 5',
    flow:      'M4 4h4v4H4zM12 4h4v4h-4zM4 12h4v4H4zM12 12h4v4h-4zM8 6h4M6 8v4M14 8v4',
    target:    'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM10 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
    star:      'M10 2l2.5 5.5L18 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L10 2z',
    grid:      'M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}>
      <path d={p[name] || p.grid} />
    </svg>
  );
};

export const Avatar = ({ name, size = 28 }: { name: string, size?: number }) => {
  const hues = [22, 50, 120, 180, 220, 260, 320];
  const h = hues[(name.charCodeAt(0) + name.length) % hues.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `oklch(0.86 0.06 ${h})`,
      color: `oklch(0.30 0.08 ${h})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 600, flexShrink: 0,
    }}>{name[0].toUpperCase()}</div>
  );
};

export const Btn = ({ t, kind = 'primary', icon, children, onClick, size = 'md', style }: any) => {
  const sizes: any = {
    sm: { padding: '5px 10px', fontSize: 12.5 },
    md: { padding: '8px 14px', fontSize: 13 },
    lg: { padding: '10px 18px', fontSize: 14 },
  };
  const kinds: any = {
    primary: { background: t.accent, color: '#fff', border: `1px solid ${t.accent}` },
    secondary: { background: t.surface, color: t.text, border: `1px solid ${t.border}` },
    ghost: { background: 'transparent', color: t.textMuted, border: '1px solid transparent' },
    danger: { background: t.danger, color: '#fff', border: `1px solid ${t.danger}` },
  };
  return (
    <button onClick={onClick} style={{
      ...sizes[size], ...kinds[kind],
      borderRadius: t.radiusMd, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 550,
      display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
      transition: 'background .12s, border-color .12s', ...style,
    }}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </button>
  );
};

export const Card = ({ t, children, style, padding = 16, title, subtitle, action }: any) => (
  <div style={{
    background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.radiusLg,
    ...style,
  }}>
    {title && (
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: t.textFaint, marginTop: 1 }}>{subtitle}</div>}
        </div>
        {action}
      </div>
    )}
    <div style={{ padding }}>{children}</div>
  </div>
);

export const Stat = ({ t, label, value, delta, deltaKind = 'up', sub }: any) => (
  <div>
    <div style={{ fontSize: 11.5, color: t.textFaint, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
      <div style={{ fontSize: 26, fontWeight: 600, color: t.text, letterSpacing: -0.5 }}>{value}</div>
      {delta && (
        <span style={{
          fontSize: 11.5, fontWeight: 600,
          color: deltaKind === 'up' ? t.successText : deltaKind === 'down' ? t.dangerText : t.textMuted,
          background: deltaKind === 'up' ? t.successSoft : deltaKind === 'down' ? t.dangerSoft : '#eee',
          padding: '1px 6px', borderRadius: 4,
        }}>{delta}</span>
      )}
    </div>
    {sub && <div style={{ fontSize: 11.5, color: t.textFaint }}>{sub}</div>}
  </div>
);

export const Sparkline = ({ t, data, height = 30, color, fill = true }: any) => {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const pts = data.map((v: number, i: number) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(' ');
  const c = color || t.accent;
  const fillPts = `0,${height} ${pts} ${w},${height}`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      {fill && <polyline points={fillPts} fill={c} opacity="0.12" />}
      <polyline points={pts} fill="none" stroke={c} strokeWidth="1.5" />
    </svg>
  );
};
