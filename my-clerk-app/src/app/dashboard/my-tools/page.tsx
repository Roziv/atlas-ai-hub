"use client";
import React from 'react';
import { Card, Icon, Btn, Themes, StatusPill } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';

export default function MyToolsPage() {
  const t = Themes.navy;
  const tools = [
    { name: 'Legal Clause Analyzer', status: 'published', runs: 124, lastRun: '2h ago' },
    { name: 'Support Sentiment', status: 'draft', runs: 0, lastRun: 'Never' },
  ];

  return (
    <DashboardShell persona="workspace">
      <PageHeader t={t} title="My Tools" subtitle="Manage agents and tools you have created." />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          {tools.map((tool, i) => (
            <Card key={i} t={t} padding={0}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: t.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accent }}>
                  <Icon name="flow" size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{tool.name}</div>
                  <div style={{ fontSize: 11.5, color: t.textFaint }}>{tool.runs} total runs · Last run {tool.lastRun}</div>
                </div>
                <StatusPill t={t} kind={tool.status === 'published' ? 'ok' : 'warn'} label={tool.status} />
                <Btn t={t} kind="ghost" icon="edit" />
              </div>
            </Card>
          ))}
        </div>
      </PageBody>
    </DashboardShell>
  );
}
