import { Address } from 'wagmi';
import create from 'zustand';

import { ChainId } from '~/core/types/chains';

import { createStore } from '../internal/createStore';

export interface AppSession {
  host: string;
  chainId: ChainId;
  address: Address;
  url: string;
}

export interface AppSessionsStore {
  appSessions: Record<string, AppSession>;
  getActiveSession: ({ host }: { host: string }) => AppSession | null;
  addSession: ({ host, address, chainId }: AppSession) => void;
  removeSession: ({ host }: { host: string }) => void;
  updateSessionChainId: ({
    host,
    chainId,
  }: {
    host: string;
    chainId: number;
  }) => void;
  updateSessionAddress: ({
    host,
    address,
  }: {
    host: string;
    address: Address;
  }) => void;
  clearSessions: () => void;
}

export const appSessionsStore = createStore<AppSessionsStore>(
  (set, get) => ({
    appSessions: {},
    getActiveSession: ({ host }) => {
      const appSessions = get().appSessions;
      return appSessions[host] || null;
    },
    addSession: ({ host, address, chainId, url }) => {
      const appSessions = get().appSessions;
      const existingSession = appSessions[host];
      if (!existingSession) {
        appSessions[host] = { host, address, chainId, url };
      }
      set({
        appSessions,
      });
    },
    removeSession: ({ host }) => {
      const appSessions = get().appSessions;
      delete appSessions[host];
      set({
        appSessions,
      });
    },
    updateSessionChainId: ({ host, chainId }) => {
      const appSessions = get().appSessions;
      const newSessions = {
        ...appSessions,
        [host]: {
          ...appSessions[host],
          chainId,
        },
      };
      set({
        appSessions: newSessions,
      });
    },
    updateSessionAddress: ({ host, address }) => {
      const appSessions = get().appSessions;
      const newSessions = {
        ...appSessions,
        [host]: {
          ...appSessions[host],
          address,
        },
      };
      set({
        appSessions: newSessions,
      });
    },
    clearSessions: () => set({ appSessions: {} }),
  }),
  {
    persist: {
      name: 'appSessions',
      version: 0,
    },
  },
);

export const useAppSessionsStore = create(appSessionsStore);
