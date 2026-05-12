import React, { useState, useEffect } from 'react';
import { Card, Stat, StatusPill, Icon, Avatar, Btn, SectionTitle } from './system';
import { PageHeader, PageBody } from './Shell';

// ── 1. Tool Gallery ─────────────────────────────────────
export function UserGallery({ t, go }) {
  const categories = ['All', 'Writing', 'Analysis', 'Legal', 'Marketing'];
  const [activeCat, setActiveCat] = useState('All');

  const tools = [
    { name: 'Legal Clause Analyzer', desc: 'Checks contracts for non-standard indemnity clauses.', author: 'Legal Team', runs: '2.4k', icon: 'shield' },
    { name: 'Customer Sentiment', desc: 'Analyzes support tickets for hidden frustration signals.', author: 'Priya S.', runs: '12k', icon: 'chat' },
    { name: 'Slide Deck Gen', desc: 'Creates executive summaries from raw transcript data.', author: 'Strategy', runs: '850', icon: 'grid' },
    { name: 'PR Reviewer', desc: 'Validates code commits against enterprise security standards.', author: 'DevOps', runs: '45k', icon: 'lock' },
  ];

  return (
    <>
      <PageHeader t={t} title="Tool Gallery" subtitle="Discover and use AI agents built by your colleagues."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn t={t} kind="secondary" icon="flow">Create Tool</Btn>
            <Btn t={t} kind="primary" onClick={() => go('u-builder')} icon="plus">Create Agent</Btn>
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
    </>
  );
}

// ── 2. Agent Builder ─────────────────────────────────────
export function UserBuilder({ t, go }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  
  return (
    <>
      <PageHeader t={t} title="Agent Builder" subtitle="Create custom AI tools without writing code."
        actions={<Btn t={t} kind="secondary" onClick={() => go('u-gallery')}>Cancel</Btn>} />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, height: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SectionTitle t={t} subtitle="Step 1: Define the core purpose">Agent Persona</SectionTitle>
            <Card t={t} padding={20}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.textFaint, marginBottom: 6 }}>NAME YOUR AGENT</div>
                  <input type="text" placeholder="e.g. Legal Clause Reviewer" style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${t.border}`,
                    background: t.surfaceAlt, color: t.text, fontSize: 14, outline: 'none'
                  }} value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.textFaint, marginBottom: 6 }}>INSTRUCTIONS (SYSTEM PROMPT)</div>
                  <textarea placeholder="Tell the agent how to behave..." style={{
                    width: '100%', height: 120, padding: '10px 12px', borderRadius: 8, border: `1px solid ${t.border}`,
                    background: t.surfaceAlt, color: t.text, fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit'
                  }} />
                </div>
              </div>
            </Card>

            <SectionTitle t={t} subtitle="Step 2: Add capabilities">Skills & Tools</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { name: 'Web Search', icon: 'search', enabled: true },
                { name: 'File Analysis', icon: 'doc', enabled: false },
                { name: 'Code Exec', icon: 'lock', enabled: false },
                { name: 'Image Gen', icon: 'grid', enabled: false },
              ].map(s => (
                <div key={s.name} style={{
                  padding: 12, borderRadius: 10, border: `1px solid ${s.enabled ? t.accent : t.border}`,
                  background: s.enabled ? t.accentSoft : t.surface, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer'
                }}>
                  <div style={{ color: s.enabled ? t.accent : t.textMuted }}><Icon name={s.icon} size={16} /></div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: s.enabled ? t.text : t.textMuted }}>{s.name}</div>
                  <div style={{ flex: 1 }} />
                  {s.enabled && <Icon name="check" size={14} style={{ color: t.accent }} />}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: t.surfaceAlt, borderRadius: 12, border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Preview</div>
              <StatusPill t={t} kind="warn" label="Draft" />
            </div>
            <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: t.textFaint }}>
              <Icon name="chat" size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
              <div style={{ fontSize: 14 }}>Type a message to test your agent...</div>
            </div>
            <div style={{ padding: 16, background: t.surface, borderTop: `1px solid ${t.border}` }}>
              <div style={{ background: t.surfaceAlt, borderRadius: 20, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${t.border}` }}>
                <input type="text" placeholder="Send a test message..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: 13 }} />
                <Btn t={t} kind="primary" size="sm" icon="refresh">Test</Btn>
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 24, padding: '20px 0', borderTop: `1px solid ${t.border}`, display: 'flex', justifyContent: 'flex-end' }}>
          <Btn t={t} kind="primary" size="lg" onClick={() => go('u-mine')}>Create Agent & Publish</Btn>
        </div>
      </PageBody>
    </>
  );
}

// ── 3. My Tools ──────────────────────────────────────────
export function UserTools({ t, go }) {
  const tools = [
    { name: 'Legal Clause Analyzer', status: 'published', runs: 124, lastRun: '2h ago' },
    { name: 'Support Sentiment', status: 'draft', runs: 0, lastRun: 'Never' },
  ];

  return (
    <>
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
                <Btn t={t} kind="ghost" icon="edit" onClick={() => go('u-builder')} />
              </div>
            </Card>
          ))}
        </div>
      </PageBody>
    </>
  );
}

// ── 4. My Knowledge ───────────────────────────────────────
export function UserKnowledge({ t, go }) {
  return (
    <>
      <PageHeader t={t} title="My Knowledge" subtitle="Upload documents to give your agents extra context."
        actions={<Btn t={t} icon="upload">Upload PDF/Doc</Btn>} />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <Card t={t} title="Corporate Travel Policy" subtitle="PDF · 12 pages">
            <div style={{ fontSize: 12, color: t.textMuted }}>Used by 2 agents</div>
          </Card>
          <Card t={t} title="Q3 Legal Templates" subtitle="Folder · 45 files">
            <div style={{ fontSize: 12, color: t.textMuted }}>Shared with Legal Team</div>
          </Card>
          <Card t={t} title="Brand Voice Guidelines" subtitle="DOCX · 4 pages">
            <div style={{ fontSize: 12, color: t.textMuted }}>Global access</div>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
