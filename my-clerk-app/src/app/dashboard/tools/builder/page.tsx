"use client";
import React, { useState, useEffect } from 'react';
import { Card, Btn, Themes, Icon, StatusPill } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { apiFetch } from '@/lib/api';

export default function ToolBuilderPage() {
  const t = Themes.navy;
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

   // Form State
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('api');
  
  // Structured API Config
  const [apiUrl, setApiUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [authType, setAuthType] = useState('none');
  const [authKey, setAuthKey] = useState('');
  
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchTools = async () => {
    if (!organization) return;
    setLoading(true);
    try {
      const token = await getToken();
      const json = await apiFetch('/api/tools', {}, token || undefined, organization.id);
      if (json.success) setTools(json.data.tools);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organization) {
      fetchTools();
    }
  }, [organization, getToken]);

   const handleTestTool = async () => {
    setTesting(true);
    setTestResult(null);
    try {
        // In a real app, this would hit a secure proxy in the backend
        // For the demo, we'll simulate a successful connection
        setTimeout(() => {
            setTestResult({
                status: 200,
                data: { message: "Successfully connected to " + (apiUrl || "Endpoint"), sample: { id: 101, status: "active", latency: "42ms" } }
            });
            setTesting(false);
        }, 1200);
    } catch (e) {
        setTestResult({ error: "Connection Failed" });
        setTesting(false);
    }
  };
  
  const handleSave = async () => {
    if (!name || !organization) return;
    setSaving(true);
    try {
      const token = await getToken();
      const toolConfig = {
        url: apiUrl,
        method: method,
        auth: { type: authType, key: authKey }
      };
      
      const json = await apiFetch('/api/tools', {
        method: 'POST',
        body: JSON.stringify({ name, description: desc, type, config: toolConfig }),
      }, token || undefined, organization?.id);

      if (json.success) {
        setName(''); setDesc(''); setApiUrl(''); setAuthKey('');
        fetchTools();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell persona="workspace">
      <PageHeader t={t} title="Tool Builder" subtitle="Define functional skills and API connectors for your AI fleet" />
      <PageBody t={t}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card t={t} title="Define New Skill" subtitle="Choose a trigger and execution logic">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, marginBottom: 6 }}>TOOL NAME</div>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Google Search, SQL Query..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, outline: 'none' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, marginBottom: 6 }}>DESCRIPTION</div>
                  <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="What does this tool do?"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, marginBottom: 6 }}>TYPE</div>
                    <select value={type} onChange={e => setType(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, outline: 'none' }}>
                      <option value="api">Rest API</option>
                      <option value="script">Custom Script</option>
                      <option value="database">Database Query</option>
                      <option value="web">Web Browser</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textFaint, marginBottom: 6 }}>ACCESS LEVEL</div>
                    <select style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, outline: 'none' }}>
                      <option>Organization-wide</option>
                      <option>Team Specific</option>
                      <option>Private</option>
                    </select>
                  </div>
                </div>
                <div style={{ padding: '20px 16px', borderRadius: 12, background: t.surface, border: `1px solid ${t.border}`, borderLeft: `4px solid ${t.accent}` }}>
                   <div style={{ fontSize: 11, fontWeight: 700, color: t.accent, marginBottom: 16, textTransform: 'uppercase' }}>REST API Configuration</div>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, marginBottom: 16 }}>
                      <select value={method} onChange={e => setMethod(e.target.value)}
                        style={{ padding: '10px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, fontWeight: 700 }}>
                         {['GET', 'POST', 'PUT', 'DELETE'].map(m => <option key={m}>{m}</option>)}
                      </select>
                      <input type="text" value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://api.enterprise.com/v1/data"
                        style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, outline: 'none' }} />
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 10, color: t.textFaint, marginBottom: 4 }}>AUTHENTICATION</div>
                        <select value={authType} onChange={e => setAuthType(e.target.value)}
                           style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text }}>
                           <option value="none">No Auth</option>
                           <option value="bearer">Bearer Token</option>
                           <option value="apikey">API Key (Header)</option>
                        </select>
                      </div>
                      {authType !== 'none' && (
                        <div>
                           <div style={{ fontSize: 10, color: t.textFaint, marginBottom: 4 }}>CREDENTIAL / KEY</div>
                           <input type="password" value={authKey} onChange={e => setAuthKey(e.target.value)} placeholder="••••••••••••"
                              style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text }} />
                        </div>
                      )}
                   </div>
                </div>

                {testResult && (
                  <div style={{ padding: 12, borderRadius: 8, background: testResult.error ? t.dangerSoft : t.successSoft, border: `1px solid ${testResult.error ? t.danger : t.success}` }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Icon name={testResult.error ? 'alert' : 'check'} size={14} style={{ color: testResult.error ? t.danger : t.success }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: testResult.error ? t.dangerText : t.successText }}>
                           {testResult.error ? 'Connection Error' : `Success (Status ${testResult.status})`}
                        </span>
                     </div>
                     <pre style={{ fontSize: 10, color: t.text, overflow: 'auto', background: 'rgba(255,255,255,0.5)', padding: 8, borderRadius: 4 }}>
                        {JSON.stringify(testResult.data || testResult.error, null, 2)}
                     </pre>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <Btn t={t} kind="secondary" onClick={handleTestTool} disabled={testing}>{testing ? 'Connecting...' : 'Test Connection'}</Btn>
                  <Btn t={t} kind="primary" icon="plus" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Create Skill'}</Btn>
                </div>
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card t={t} title="Available Skills" subtitle="Existing tools ready for deployment">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                {loading ? <div style={{ color: t.textMuted }}>Loading library...</div> : tools.map(tool => (
                  <div key={tool.id} style={{ padding: 12, borderRadius: 10, background: t.surfaceAlt, border: `1px solid ${t.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: t.accentSoft, color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name={tool.type === 'api' ? 'globe' : tool.type === 'script' ? 'cpu' : 'database'} size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{tool.name}</div>
                          <div style={{ fontSize: 11, color: t.textFaint }}>{tool.type.toUpperCase()} · v1.0</div>
                        </div>
                      </div>
                      <StatusPill t={t} kind="ok" label="Active" />
                    </div>
                  </div>
                ))}
                {tools.length === 0 && !loading && <div style={{ textAlign: 'center', padding: 20, color: t.textFaint, fontSize: 12 }}>No tools created yet.</div>}
              </div>
            </Card>

            <Card t={t} title="Marketplace Integration" subtitle="Import pre-built skills from partners">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                {['Salesforce', 'Slack', 'Snowflake', 'Stripe'].map(p => (
                  <div key={p} style={{ padding: 12, borderRadius: 8, background: t.surface, border: `1px solid ${t.border}`, textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted }}>{p}</div>
                  </div>
                ))}
              </div>
              <Btn t={t} kind="secondary" size="sm" block style={{ marginTop: 12 }}>Browse Marketplace</Btn>
            </Card>
          </div>

        </div>
      </PageBody>
    </DashboardShell>
  );
}
