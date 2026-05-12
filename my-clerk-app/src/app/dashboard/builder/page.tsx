"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Card, Btn, Themes, Icon, StatusPill, Avatar } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';
import { useAuth, useOrganization, useUser } from '@clerk/nextjs';
import { apiFetch } from '@/lib/api';
import { useEnterpriseStore } from '@/store/useEnterpriseStore';

export default function AgentBuilderPage() {
  const t = Themes.navy;
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const { aiSettings, loading: storeLoading, fetchEnterpriseData } = useEnterpriseStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Agent Configuration State
  const [agentName, setAgentName] = useState('New Assistant');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [isPublished, setIsPublished] = useState(true);
  const [instructions, setInstructions] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availableTools, setAvailableTools] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const initData = async () => {
    if (!organization) return;
    
    try {
      const token = await getToken();
      await fetchEnterpriseData(token || undefined, organization.id);
      
      const json = await apiFetch('/api/tools', {}, token || undefined, organization.id);
      if (json.success) {
        setAvailableTools(json.data.tools || []);
      }
    } catch (err: any) {
      setError(`Failed to initialize builder: ${err.message}`);
    }
  };

  useEffect(() => {
    initData();
  }, [organization, getToken]);

  const { user } = useUser();

  // Find the active model for this user's department
  const userDept = (user?.publicMetadata?.department as string) || 'Default';
  const activeRule = aiSettings.routingRules?.find((r: any) => r.department === userDept) || aiSettings.routingRules?.[0];
  const activeModel = aiSettings.modelLibrary?.find((m: any) => m.id === activeRule?.modelId) || aiSettings.modelLibrary?.[0];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || !organization) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = await getToken();
      const json = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          userId: user?.id,
          agentConfig: {
            name: agentName,
            instructions: instructions,
            skills: selectedSkills
          }
        }),
      }, token || undefined, organization.id);

      if (json.success) {
        setMessages(prev => [...prev, json.data]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${json.error || 'Unknown failure'}` }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Connection Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAgent = async () => {
    if (!organization) return;
    setSaving(true);
    try {
      const token = await getToken();
      const res = await apiFetch('/api/agents', {
        method: 'POST',
        body: JSON.stringify({
          name: agentName,
          description: description || `Custom agent: ${agentName}`,
          category,
          isPublished,
          creatorId: user?.id,
          creatorName: user?.fullName || user?.username || 'Employee',
          definition: { instructions, skills: selectedSkills }
        }),
      }, token || undefined, organization.id);

      if (res.success) {
        alert(isPublished ? 'Agent published to Registry!' : 'Agent saved to private library!');
      } else {
        alert(`Failed to save agent: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Connection Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleSkill = (id: string) => {
    setSelectedSkills(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <DashboardShell persona="workspace">
      <PageHeader t={t} title="Agent Builder" subtitle="Design and test autonomous AI agents for your team"
        actions={<Btn t={t} kind="primary" icon="check" onClick={handleSaveAgent} disabled={saving}>{saving ? 'Saving...' : 'Save & Publish'}</Btn>} />
      
      <PageBody t={t}>
        {error && (
          <div style={{ padding: 16, background: t.dangerSoft, color: t.dangerText, borderRadius: 12, marginBottom: 20, border: `1px solid ${t.danger}`, fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, height: 'calc(100vh - 200px)' }}>
          
          {/* Left Panel: Configuration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', paddingRight: 10 }}>
            <Card t={t} title="Agent Core" subtitle="Identity and behavioral constraints">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                         <div style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: 'uppercase' }}>Agent Name</div>
                         <input type="text" value={agentName} onChange={e => setAgentName(e.target.value)} 
                           style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${t.border}`, background: t.surface, color: t.text, fontSize: 13, outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                         <div style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: 'uppercase' }}>Category</div>
                         <select value={category} onChange={e => setCategory(e.target.value)}
                           style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${t.border}`, background: t.surface, color: t.text, fontSize: 13, outline: 'none' }}>
                            {['General', 'Marketing', 'Sales', 'Engineering', 'HR', 'Support'].map(c => <option key={c}>{c}</option>)}
                         </select>
                      </div>
                   </div>

                   <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: 'uppercase' }}>Description</div>
                      <input type="text" placeholder="What does this agent do?" value={description} onChange={e => setDescription(e.target.value)} 
                        style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${t.border}`, background: t.surface, color: t.text, fontSize: 13, outline: 'none' }} />
                   </div>

                   <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, textTransform: 'uppercase' }}>System Instructions</div>
                      <textarea placeholder="e.g. You are a creative copywriter..." value={instructions} onChange={e => setInstructions(e.target.value)} 
                        style={{ width: '100%', height: 120, padding: '10px 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, outline: 'none', resize: 'none', fontSize: 13 }} />
                   </div>

                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: t.surfaceAlt, border: `1px solid ${t.border}` }}>
                      <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} style={{ cursor: 'pointer' }} id="pub-check" />
                      <label htmlFor="pub-check" style={{ fontSize: 12, fontWeight: 600, color: t.text, cursor: 'pointer', flex: 1 }}>Publish to Enterprise Registry</label>
                      <StatusPill t={t} kind={isPublished ? 'ok' : 'warn'} label={isPublished ? 'Public' : 'Private'} />
                   </div>
                </div>
              </div>
            </Card>

            <Card t={t} title="Skills & Tools" subtitle="Grant this agent functional capabilities">
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {availableTools.map(tool => (
                    <div key={tool.id} 
                      onClick={() => toggleSkill(tool.id)}
                      style={{ 
                        padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                        background: selectedSkills.includes(tool.id) ? t.accentSoft : t.surfaceAlt,
                        border: `1px solid ${selectedSkills.includes(tool.id) ? t.accent : t.border}`,
                        display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                      }}>
                      <div style={{ color: selectedSkills.includes(tool.id) ? t.accent : t.textFaint }}><Icon name="zap" size={14} /></div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: selectedSkills.includes(tool.id) ? t.accentText : t.text }}>{tool.name}</div>
                    </div>
                  ))}
                  {availableTools.length === 0 && <div style={{ fontSize: 11, color: t.textFaint }}>No tools found. Create one in the Tool Builder!</div>}
               </div>
            </Card>

            <Card t={t} title="Governance Profile" subtitle="Automatic compliance checks">
               <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ fontSize: 12, color: t.textMuted }}>Active Intelligence</div>
                     <StatusPill t={t} kind="ok" label={activeModel ? `${activeModel.name} (${activeModel.provider})` : 'Default'} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ fontSize: 12, color: t.textMuted }}>Data Privacy (PII)</div>
                     <StatusPill t={t} kind="ok" label="Enabled" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ fontSize: 12, color: t.textMuted }}>Budget Guardrails</div>
                     <StatusPill t={t} kind="ok" label="Enabled" />
                  </div>
               </div>
            </Card>
          </div>

          {/* Right Panel: Chat Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', background: t.surface, borderRadius: 20, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border}`, background: t.surfaceAlt, display: 'flex', alignItems: 'center', gap: 12 }}>
               <Avatar name={agentName} size={32} />
               <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{agentName}</div>
                  <div style={{ fontSize: 11, color: t.successText }}>• Live Preview</div>
               </div>
            </div>

            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.length === 0 && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: t.textFaint }}>
                   <Icon name="chat" size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                   <div style={{ fontSize: 14, fontWeight: 600 }}>Preview Chat</div>
                   <div style={{ fontSize: 12 }}>Test your agent's behavior here</div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{ 
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: 16,
                  background: m.role === 'user' ? '#1E40AF' : t.surfaceAlt,
                  color: m.role === 'user' ? '#FFFFFF' : t.text,
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  {m.content}
                </div>
              ))}
              {loading && <div style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: 16, background: t.surfaceAlt, color: t.textFaint, fontSize: 12 }}>Thinking...</div>}
            </div>

            <div style={{ padding: 20, borderTop: `1px solid ${t.border}` }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Send a test message..."
                  style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, outline: 'none' }}
                />
                <Btn t={t} kind="primary" onClick={handleSend} disabled={loading} icon="send" />
              </div>
            </div>
          </div>

        </div>
      </PageBody>
    </DashboardShell>
  );
}
