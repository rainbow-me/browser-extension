import { Address } from 'wagmi';
import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface AppSessionsStore {
  appSessions: { host: string; address: Address; chainId: number }[];
  isActiveSession: (host?: string) => boolean;
  addSession: (host: string, address: Address, chainId: number) => void;
  removeSession: (host: string) => void;
  updateSessionChainId: (host: string, chainId: number) => void;
  updateSessionAddress: (host: string, address: Address) => void;
  clearSessions: () => void;
}

export const appSessionsStore = createStore<AppSessionsStore>(
  (set, get) => ({
    appSessions: [],
    isActiveSession: (host) => {
      const appSessions = get().appSessions;
      return !!host && !!appSessions.find((session) => session.host === host);
    },
    addSession: (host, address, chainId) => {
      const appSessions = get().appSessions;
      const existingSession = appSessions.find(
        (session) => session.host === host,
      );
      set({
        appSessions: existingSession
          ? appSessions
          : appSessions.concat([{ host, address, chainId }]),
      });
    },
    removeSession: (host) => {
      const appSessions = get().appSessions;
      set({
        appSessions: appSessions.filter((session) => session.host !== host),
      });
    },
    updateSessionChainId: (host, chainId) => {
      const appSessions = get().appSessions;
      const newSessions = appSessions.map((session) => {
        if (session.host === host) {
          return { ...session, chainId };
        }
        return session;
      });
      set({
        appSessions: newSessions,
      });
    },
    updateSessionAddress: (host, address) => {
      const appSessions = get().appSessions;
      const newSessions = appSessions.map((session) => {
        if (session.host === host) {
          return { ...session, address };
        }
        return session;
      });
      set({
        appSessions: newSessions,
      });
    },
    clearSessions: () => set({ appSessions: [] }),
  }),
  {
    persist: {
      name: 'appSessions',
      version: 0,
    },
  },
);

export const useAppSessionsStore = create(appSessionsStore);
