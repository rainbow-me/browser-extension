import { Address } from 'wagmi';
import create from 'zustand';

import { ChainId } from '~/core/types/chains';

import { createStore } from '../internal/createStore';

export interface AppSession {
  host: string;
  sessions: Record<Address, ChainId>;
  activeSession: { address: Address; chainId: ChainId };
  url: string;
}

interface V0AppSession {
  host: string;
  chainId: number;
  address: Address;
  url: string;
}

export interface AppSessionsStore<T extends AppSession | V0AppSession> {
  appSessions: Record<string, T>;
  getActiveSession: ({ host }: { host: string }) => T | null;
  addSession: ({
    host,
    address,
    chainId,
    url,
  }: {
    host: string;
    address: Address;
    chainId: ChainId;
    url: string;
  }) => void;
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

export const appSessionsStore = createStore<AppSessionsStore<AppSession>>(
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
        appSessions[host] = {
          host,
          sessions: { [address]: chainId },
          activeSession: { address, chainId },
          url,
        };
      } else {
        appSessions[host].sessions[address] = chainId;
        appSessions[host].activeSession = { address, chainId };
      }
      const updatedSessions = {
        ...appSessions,
      };
      set({
        appSessions: updatedSessions,
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
      const activeSession = appSessions[host].activeSession;
      const updatedSessions = {
        ...appSessions,
        [host]: {
          ...appSessions[host],
          activeSession: {
            address: activeSession.address,
            chainId,
          },
          sessions: {
            ...appSessions[host].sessions,
            [activeSession.address]: chainId,
          },
        },
      };
      set({
        appSessions: updatedSessions,
      });
    },
    updateSessionAddress: ({ host, address }) => {
      const appSessions = get().appSessions;
      appSessions[host].activeSession.address = address;
      const updatedSessions = {
        ...appSessions,
      };
      set({
        appSessions: updatedSessions,
      });
    },
    clearSessions: () => set({ appSessions: {} }),
  }),
  {
    persist: {
      name: 'appSessions',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          const v0PersistedState =
            persistedState as AppSessionsStore<V0AppSession>;
          const appSessions: Record<string, AppSession> = {};
          Object.values(v0PersistedState.appSessions).forEach((appSession) => {
            appSessions[appSession.host] = {
              sessions: { [appSession.address]: appSession.chainId },
              activeSession: {
                address: appSession.address,
                chainId: appSession.chainId,
              },
              url: appSession.url,
              host: appSession.host,
            };
          });

          return {
            ...v0PersistedState,
            appSessions,
          } as AppSessionsStore<AppSession>;
        }
        return persistedState as AppSessionsStore<AppSession>;
      },
    },
  },
);

export const useAppSessionsStore = create(appSessionsStore);
