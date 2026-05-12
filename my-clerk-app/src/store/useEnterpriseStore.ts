import { create } from 'zustand';
import { apiFetch } from '@/lib/api';

interface EnterpriseState {
  organization: any | null;
  aiSettings: any;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchEnterpriseData: (token?: string, orgId?: string) => Promise<void>;
  updateAiSettings: (newSettings: any, token?: string, orgId?: string) => Promise<boolean>;
}

export const useEnterpriseStore = create<EnterpriseState>((set, get) => ({
  organization: null,
  aiSettings: {
    providers: {},
    modelLibrary: [],
    routingRules: []
  },
  loading: false,
  error: null,

  fetchEnterpriseData: async (token?: string, orgId?: string) => {
    set({ loading: true, error: null });
    try {
      const json = await apiFetch('/api/settings/ai', {}, token, orgId);
      
      if (json.success) {
        set({ 
          aiSettings: json.data,
          organization: { slug: 'acme-corp' } 
        });
      } else {
        set({ error: json.error || 'Failed to fetch enterprise data' });
      }
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  updateAiSettings: async (newSettings: any, token?: string, orgId?: string) => {
    try {
      const json = await apiFetch('/api/settings/ai', {
        method: 'POST',
        body: JSON.stringify({ aiSettings: newSettings }),
      }, token, orgId);
      
      if (json.success) {
        set({ aiSettings: newSettings });
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Store Save Failed", err);
      return false;
    }
  }
}));
