import create from 'zustand';
import { createStore } from './internal/createStore';

export interface ApprovedHostsStore {
  approvedHosts: string[];
  isApprovedHost: (host?: string) => boolean;
  addApprovedHost: (host: string) => void;
  clearApprovedHosts: () => void;
}
export const approvedHostsStore = createStore<ApprovedHostsStore>(
  (set, get) => ({
    approvedHosts: [],
    isApprovedHost: (host) => {
      const approvedHosts = get().approvedHosts;
      return !!host && approvedHosts.includes(host);
    },
    addApprovedHost: (host) => {
      const approvedHosts = get().approvedHosts;
      set({ approvedHosts: approvedHosts.concat([host]) });
    },
    clearApprovedHosts: () => set({ approvedHosts: [] }),
  }),
  {
    persist: {
      name: 'approvedHosts',
      version: 0,
    },
  },
);

export const useApprovedHostsStore = create(approvedHostsStore);
