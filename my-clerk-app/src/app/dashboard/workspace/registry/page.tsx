"use client";
import React, { useState, useEffect } from 'react';
import { Card, Btn, Themes, Icon, StatusPill, Avatar } from '@/components/dashboard/System';
import { DashboardShell, PageHeader, PageBody } from '@/components/dashboard/DashboardShell';

import { useAuth, useOrganization } from '@clerk/nextjs';
import { apiFetch } from '@/lib/api';

const CATEGORIES = ['All', 'General', 'Marketing', 'Sales', 'Engineering', 'HR', 'Support'];

export default function AgentRegistryPage() {
  const t = Themes.navy;
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!organization) return;
    
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const json = await apiFetch('/api/agents?published=true', {}, token || undefined, organization.id);
        if (json.success) {
          const data = Array.isArray(json.data) ? json.data : (json.data.agents || []);
          setAgents(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgents();
  }, [organization, getToken]);

  const filteredAgents = (Array.isArray(agents) ? agents : []).filter(a => {
    const matchesFilter = filter === 'All' || a.category === filter;
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                          a.description?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <DashboardShell persona="workspace">
      <PageHeader 
        t={t} 
        title="Agent Registry" 
        subtitle="Discover and activate AI agents built by your organization" 
      />
      
      <PageBody t={t}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Filters Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.surfaceAlt, padding: '12px 20px', borderRadius: 12, border: `1px solid ${t.border}` }}>
             <div style={{ display: 'flex', gap: 8 }}>
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setFilter(cat)}
                    style={{ 
                      padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      background: filter === cat ? t.accent : 'transparent',
                      color: filter === cat ? t.accentText : t.textMuted,
                      border: filter === cat ? `1px solid ${t.accent}` : '1px solid transparent',
                      transition: 'all 0.2s'
                    }}>
                    {cat}
                  </button>
                ))}
             </div>
             
             <div style={{ display: 'flex', alignItems: 'center', background: t.surface, padding: '6px 12px', borderRadius: 8, border: `1px solid ${t.border}`, width: 300 }}>
                <Icon name="search" size={14} style={{ color: t.textFaint, marginRight: 8 }} />
                <input 
                  type="text" 
                  placeholder="Search agents..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ background: 'none', border: 'none', color: t.text, fontSize: 12, outline: 'none', width: '100%' }}
                />
             </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ padding: 100, textAlign: 'center', color: t.textFaint }}>Loading registry...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {filteredAgents.map(agent => (
                <Card key={agent.id} t={t} style={{ padding: 0, overflow: 'hidden', transition: 'transform 0.2s' }}>
                   <div style={{ padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                         <div style={{ width: 48, height: 48, borderRadius: 12, background: t.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accent }}>
                            <Icon name={agent.icon || 'bot'} size={24} />
                         </div>
                         <StatusPill t={t} kind="ok" label={agent.category} />
                      </div>
                      
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 8 }}>{agent.name}</h3>
                      <p style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5, height: 40, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 20 }}>
                        {agent.description || "No description provided."}
                      </p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}`, marginBottom: 20 }}>
                         <Avatar name={agent.creatorName || 'Employee'} size={24} />
                         <div style={{ fontSize: 11, color: t.textFaint }}>
                            Built by <span style={{ color: t.text, fontWeight: 600 }}>{agent.creatorName || 'Anonymous'}</span>
                         </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: 10 }}>
                         <Btn t={t} kind="primary" style={{ flex: 1 }} icon="plus">Activate Agent</Btn>
                         <Btn t={t} kind="secondary" icon="search">Details</Btn>
                      </div>
                   </div>
                </Card>
              ))}
              
              {filteredAgents.length === 0 && (
                <div style={{ gridColumn: '1/-1', padding: 100, textAlign: 'center', background: t.surfaceAlt, borderRadius: 20, border: `2px dashed ${t.border}` }}>
                   <Icon name="bot" size={48} style={{ color: t.textFaint, marginBottom: 12 }} />
                   <div style={{ fontSize: 16, fontWeight: 600, color: t.text }}>No agents found</div>
                   <div style={{ fontSize: 14, color: t.textMuted }}>Try adjusting your search or category filter</div>
                </div>
              )}
            </div>
          )}

        </div>
      </PageBody>
    </DashboardShell>
  );
}
