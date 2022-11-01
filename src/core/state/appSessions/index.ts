import { Address } from 'wagmi';
import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface AppSessionsStore {
  appSessions: Record<
    string,
    { host: string; address: Address; chainId: number }
  >;
  isActiveSession: ({ host }: { host: string }) => boolean;
  addSession: (host: string, address: Address, chainId: number) => void;
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
    isActiveSession: ({ host }) => {
      const appSessions = get().appSessions;
      return !!host && !!appSessions[host];
    },
    addSession: (host, address, chainId) => {
      const appSessions = get().appSessions;
      const existingSession = appSessions[host];
      if (!existingSession) {
        appSessions[host] = { host, address, chainId };
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
