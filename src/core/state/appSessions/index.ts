import { Address } from 'wagmi';
import create from 'zustand';

import { ChainId } from '~/core/types/chains';

import { createStore } from '../internal/createStore';

export interface AppSession {
  activeSessionAddress: Address;
  host: string;
  sessions: Record<Address, ChainId>;
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
  getActiveSession: ({ host }: { host: string }) => {
    address: Address;
    chainId: ChainId;
  } | null;
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
  removeSession: ({
    host,
    address,
  }: {
    host: string;
    address: Address;
  }) => void;
  removeAppSession: ({ host }: { host: string }) => void;
  updateActiveSession: ({
    host,
    address,
  }: {
    host: string;
    address: Address;
  }) => void;
  updateActiveSessionChainId: ({
    host,
    chainId,
  }: {
    host: string;
    chainId: number;
  }) => void;
  updateSessionChainId: ({
    address,
    host,
    chainId,
  }: {
    address: Address;
    host: string;
    chainId: number;
  }) => void;
  clearSessions: () => void;
}

export const appSessionsStore = createStore<AppSessionsStore<AppSession>>(
  (set, get) => ({
    appSessions: {},
    getActiveSession: ({ host }) => {
      const appSessions = get().appSessions;
      const activeSessionAddress = appSessions[host]?.activeSessionAddress;
      const sessions = appSessions[host]?.sessions;
      return activeSessionAddress
        ? {
            address: activeSessionAddress,
            chainId: sessions[activeSessionAddress],
          }
        : null;
    },
    addSession: ({ host, address, chainId, url }) => {
      const appSessions = get().appSessions;
      const existingSession = appSessions[host];
      if (!existingSession) {
        appSessions[host] = {
          host,
          sessions: { [address]: chainId },
          activeSessionAddress: address,
          url,
        };
      } else {
        appSessions[host].sessions[address] = chainId;
        appSessions[host].activeSessionAddress = address;
      }
      set({
        appSessions: {
          ...appSessions,
        },
      });
    },
    removeAppSession: ({ host }) => {
      const appSessions = get().appSessions;
      delete appSessions[host];
      set({
        appSessions: {
          ...appSessions,
        },
      });
    },
    removeSession: ({ host, address }) => {
      const appSessions = get().appSessions;
      const appSession = appSessions[host];
      if (Object.keys(appSession.sessions).length === 1) {
        delete appSessions[host];
      } else {
        delete appSession.sessions[address];
        appSession.activeSessionAddress = Object.keys(
          appSession.sessions,
        )[0] as Address;
      }
      set({
        ...appSessions,
        [host]: {
          ...appSession,
        },
      });
    },
    updateActiveSession: ({ host, address }) => {
      const appSessions = get().appSessions;
      const appSession = appSessions[host];
      set({
        ...appSessions,
        [host]: {
          ...appSession,
          activeSessionAddress: address,
        },
      });
    },
    updateActiveSessionChainId: ({ host, chainId }) => {
      const appSessions = get().appSessions;
      const appSession = appSessions[host];
      set({
        appSessions: {
          ...appSessions,
          [host]: {
            ...appSession,
            sessions: {
              ...appSession.sessions,
              [appSession.activeSessionAddress]: chainId,
            },
          },
        },
      });
    },
    updateSessionChainId: ({ host, address, chainId }) => {
      const appSessions = get().appSessions;
      const appSession = appSessions[host];
      set({
        appSessions: {
          ...appSessions,
          [host]: {
            ...appSession,
            sessions: {
              ...appSession.sessions,
              [address]: chainId,
            },
          },
        },
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
              activeSessionAddress: appSession.address,
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
