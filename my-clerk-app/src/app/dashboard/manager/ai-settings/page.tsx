"use client";
import React, { useState, useEffect } from 'react';
import { Card, Btn, Themes, Icon, StatusPill } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { useEnterpriseStore } from '@/store/useEnterpriseStore';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'Product', 'Legal', 'Support', 'Finance', 'HR', 'Operations'];

export default function AiSettingsPage() {
  const t = Themes.navy;
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const { aiSettings, loading, fetchEnterpriseData, updateAiSettings } = useEnterpriseStore();
  const [config, setConfig] = useState<any>(aiSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (organization) {
      const load = async () => {
        const token = await getToken();
        console.log('[AiSettings] Fetching data for org:', organization.id);
        await fetchEnterpriseData(token || undefined, organization.id);
      };
      load();
    }
  }, [organization, getToken]);

  useEffect(() => {
    console.log('[AiSettings] aiSettings updated:', aiSettings);
    if (aiSettings && Object.keys(aiSettings).length > 0) {
      setConfig(aiSettings);
    }
  }, [aiSettings]);

  const handleSave = async () => {
    console.log('[AiSettings] Saving config:', config);
    if (!organization) return;
    setSaving(true);
    try {
      const token = await getToken();
      const success = await updateAiSettings(config, token || undefined, organization.id);
      if (success) {
        alert('✅ Enterprise AI Configuration saved and applied successfully!');
      } else {
        alert('❌ Failed to save configuration.');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error saving configuration.');
    } finally {
      setSaving(false);
    }
  };

  const addModel = () => {
    const id = 'm' + Math.random().toString(36).substr(2, 5);
    setConfig({
      ...config,
      modelLibrary: [...config.modelLibrary, { id, name: 'New Model', provider: 'openai', modelId: '' }]
    });
  };

  const updateModel = (id: string, field: string, value: string) => {
    setConfig({
      ...config,
      modelLibrary: config.modelLibrary.map((m: any) => m.id === id ? { ...m, [field]: value } : m)
    });
  };

  const removeModel = (id: string) => {
    setConfig({
      ...config,
      modelLibrary: config.modelLibrary.filter((m: any) => m.id !== id),
      routingRules: config.routingRules.filter((r: any) => r.modelId !== id)
    });
  };

  const addRule = () => {
    setConfig({
      ...config,
      routingRules: [...config.routingRules, { department: 'Marketing', modelId: config.modelLibrary[0]?.id || '' }]
    });
  };

  const updateRule = (index: number, field: string, value: string) => {
    const newRules = [...config.routingRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setConfig({ ...config, routingRules: newRules });
  };

  const removeRule = (index: number) => {
    setConfig({ ...config, routingRules: config.routingRules.filter((_:any, i:number) => i !== index) });
  };

  if (loading) return (
    <DashboardShell persona="manager">
      <div style={{ padding: 100, textAlign: 'center', color: t.textFaint }}>Syncing infrastructure settings...</div>
    </DashboardShell>
  );

  const storeError = useEnterpriseStore.getState().error;
  if (storeError && !config) return (
    <DashboardShell persona="manager">
      <div style={{ padding: 100, textAlign: 'center', color: t.danger }}>Error: {storeError}</div>
    </DashboardShell>
  );

  return (
    <DashboardShell persona="manager">
      <PageHeader t={t} title="Enterprise AI Configuration" subtitle="Define the organization's LLM landscape and departmental guardrails" />
      <PageBody t={t}>
        <div style={{ maxWidth: 1000, display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <Card t={t} title="Infrastructure & Connectivity" subtitle="Manage global API keys and endpoint endpoints">
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 16 }}>
                {['openai', 'anthropic', 'ollama', 'ollama_cloud', 'gemini', 'groq'].map(p => {
                   const data = config?.providers?.[p] || {};
                   return (
                    <div key={p} style={{ padding: 12, borderRadius: 10, background: t.surfaceAlt, border: `1px solid ${t.border}` }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, textTransform: 'capitalize' }}>
                          <Icon name={p.includes('ollama') ? 'cpu' : 'zap'} size={14} style={{ color: t.accent }} />
                          <div style={{ fontSize: 12, fontWeight: 700 }}>{p.replace('_', ' ')}</div>
                       </div>
                       
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {(p === 'ollama' || p === 'ollama_cloud') && (
                             <input type="text" value={data.baseUrl || ''} placeholder="URL (e.g. https://...)" 
                               onChange={e => {
                                 const newProviders = { ...config.providers };
                                 newProviders[p] = { ...newProviders[p], baseUrl: e.target.value };
                                 setConfig({ ...config, providers: newProviders });
                               }}
                               style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${t.border}`, background: t.surface, color: t.text, fontSize: 12, outline: 'none' }} />
                          )}
                          
                          {p !== 'ollama' && (
                             <input type="password" value={data.apiKey || ''} placeholder={`${p.charAt(0).toUpperCase() + p.slice(1)} API Key`} 
                               onChange={e => {
                                 const newProviders = { ...config.providers };
                                 newProviders[p] = { ...newProviders[p], apiKey: e.target.value };
                                 setConfig({ ...config, providers: newProviders });
                               }}
                               style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${t.border}`, background: t.surface, color: t.text, fontSize: 12, outline: 'none' }} />
                          )}
                       </div>
                    </div>
                   );
                })}
             </div>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
            <Card t={t} title="Enterprise Model Library" subtitle="The allowed catalog of LLMs for your team">
               <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                  {config.modelLibrary.map((m: any) => (
                    <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 40px', gap: 8, padding: 10, borderRadius: 8, background: t.surfaceAlt, border: `1px solid ${t.border}`, alignItems: 'center' }}>
                       <input type="text" value={m.name || ''} onChange={e => updateModel(m.id, 'name', e.target.value)} 
                         style={{ padding: '6px 8px', borderRadius: 4, border: 'none', background: t.surface, color: t.text, fontSize: 12, fontWeight: 600 }} />
                        <select value={m.provider || 'openai'} onChange={e => updateModel(m.id, 'provider', e.target.value)}
                          style={{ padding: '6px', borderRadius: 4, border: 'none', background: t.surface, color: t.text, fontSize: 11 }}>
                          <option value="openai">OpenAI</option>
                          <option value="anthropic">Anthropic</option>
                          <option value="gemini">Gemini</option>
                          <option value="groq">Groq Cloud</option>
                          <option value="ollama">Ollama</option>
                          <option value="ollama_cloud">Ollama Cloud</option>
                        </select>
                       <input type="text" value={m.modelId || ''} placeholder="ID" onChange={e => updateModel(m.id, 'modelId', e.target.value)} 
                         style={{ padding: '6px 8px', borderRadius: 4, border: 'none', background: t.surface, color: t.text, fontSize: 11 }} />
                       <button onClick={() => removeModel(m.id)} style={{ background: 'none', border: 'none', color: t.danger, cursor: 'pointer' }}><Icon name="lock" size={14} /></button>
                    </div>
                  ))}
                  <Btn t={t} kind="secondary" size="sm" icon="plus" onClick={addModel} style={{ alignSelf: 'flex-start' }}>Register Model</Btn>
               </div>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <Card t={t} title="Global Governance & Safety" subtitle="Organization-wide AI guardrails">
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                      {[
                        { id: 'pii_redaction', label: 'Proactive PII Redaction', sub: 'Mask SSNs, Cards, and Names pre-inference', active: true },
                        { id: 'audit_all', label: 'Deep Audit Logging', sub: 'Record full prompt/completion for compliance', active: true },
                        { id: 'spend_limit', label: 'Daily Hard Limit Alerts', sub: 'Notify CFO at 90% of daily spend', active: false },
                      ].map(g => (
                        <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                           <div style={{ 
                             width: 32, height: 18, borderRadius: 9, background: g.active ? t.accent : t.border, 
                             padding: 2, cursor: 'pointer', transition: 'all 0.2s' 
                           }}>
                             <div style={{ width: 14, height: 14, borderRadius: 7, background: '#fff', marginLeft: g.active ? 14 : 0, transition: 'all 0.2s' }} />
                           </div>
                           <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{g.label}</div>
                              <div style={{ fontSize: 11, color: t.textFaint }}>{g.sub}</div>
                           </div>
                        </div>
                      ))}
                   </div>
                </Card>

                <Card t={t} title="Department Assignments" subtitle="Connect teams to models">
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                      {config.routingRules.map((rule: any, i: number) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 30px', gap: 8, alignItems: 'center' }}>
                           <select value={rule.department} onChange={e => updateRule(i, 'department', e.target.value)}
                             style={{ padding: '8px', borderRadius: 6, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, fontSize: 12 }}>
                             {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                             <option value="Default">Fallback</option>
                           </select>
                           <select value={rule.modelId} onChange={e => updateRule(i, 'modelId', e.target.value)}
                             style={{ padding: '8px', borderRadius: 6, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, fontSize: 12 }}>
                             {config.modelLibrary.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                           </select>
                           <button onClick={() => removeRule(i)} style={{ background: 'none', border: 'none', color: t.textFaint, cursor: 'pointer' }}><Icon name="lock" size={14} /></button>
                        </div>
                      ))}
                      <Btn t={t} kind="secondary" size="sm" icon="plus" onClick={addRule} style={{ alignSelf: 'flex-start' }}>Assign Department</Btn>
                   </div>
                </Card>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <Btn t={t} kind="primary" size="lg" icon="check" onClick={handleSave} disabled={saving}>
              {saving ? 'Applying...' : 'Apply Enterprise Configuration'}
            </Btn>
          </div>
        </div>
      </PageBody>
    </DashboardShell>
  );
}
