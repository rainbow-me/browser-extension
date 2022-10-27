import create from 'zustand';

import { createStore } from './internal/createStore';

export interface ApprovedHostsStore {
  approvedHosts: { url: string }[];
  isApprovedHost: (hostUrl?: string) => boolean;
  addApprovedHost: (hostUrl: string) => void;
  clearApprovedHosts: () => void;
}
export const approvedHostsStore = createStore<ApprovedHostsStore>(
  (set, get) => ({
    approvedHosts: [],
    isApprovedHost: (hostUrl) => {
      const approvedHosts = get().approvedHosts;
      return !!hostUrl && !!approvedHosts.find((host) => host.url === hostUrl);
    },
    addApprovedHost: (hostUrl) => {
      const approvedHosts = get().approvedHosts;
      set({ approvedHosts: approvedHosts.concat([{ url: hostUrl }]) });
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
