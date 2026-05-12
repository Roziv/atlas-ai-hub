"use client";
import React, { useState } from 'react';
import { Card, Icon, Btn, Themes } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';

export default function WorkspaceDashboardPage() {
  const t = Themes.navy;
  const categories = ['All', 'Writing', 'Analysis', 'Legal', 'Marketing'];
  const [activeCat, setActiveCat] = useState('All');

  const tools = [
    { name: 'Legal Clause Analyzer', desc: 'Checks contracts for non-standard indemnity clauses.', author: 'Legal Team', runs: '2.4k', icon: 'shield' },
    { name: 'Customer Sentiment', desc: 'Analyzes support tickets for hidden frustration signals.', author: 'Priya S.', runs: '12k', icon: 'chat' },
    { name: 'Slide Deck Gen', desc: 'Creates executive summaries from raw transcript data.', author: 'Strategy', runs: '850', icon: 'grid' },
    { name: 'PR Reviewer', desc: 'Validates code commits against enterprise security standards.', author: 'DevOps', runs: '45k', icon: 'lock' },
  ];

  return (
    <DashboardShell persona="workspace">
      <PageHeader t={t} title="Tool Gallery" subtitle="Discover and use AI agents built by your colleagues."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn t={t} kind="secondary" icon="flow">Create Tool</Btn>
            <Btn t={t} kind="primary" icon="plus">Create Agent</Btn>
          </div>
        } />
      <PageBody t={t}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCat(c)} style={{
              padding: '6px 14px', borderRadius: 20, border: `1px solid ${activeCat === c ? t.accent : t.border}`,
              background: activeCat === c ? t.accentSoft : t.surface,
              color: activeCat === c ? t.accent : t.textMuted,
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'all .12s'
            }}>{c}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {tools.map((tool, i) => (
            <Card key={i} t={t} padding={16} style={{ cursor: 'pointer', transition: 'transform .12s' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: 10, background: t.accentSoft, color: t.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon name={tool.icon} size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{tool.name}</div>
                  <div style={{ fontSize: 11.5, color: t.textFaint }}>by {tool.author}</div>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: t.textMuted, marginTop: 12, lineHeight: 1.5, height: 38, overflow: 'hidden' }}>
                {tool.desc}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTop: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 11.5, color: t.textFaint }}>{tool.runs} runs</div>
                <Btn t={t} kind="secondary" size="sm">Launch →</Btn>
              </div>
            </Card>
          ))}
        </div>
      </PageBody>
    </DashboardShell>
  );
}
