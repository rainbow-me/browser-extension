import { createBaseStore } from '@storesjs/stores';
import { Address } from 'viem';

import { ChainId } from '~/core/types/chains';

import { createExtensionStoreOptions } from '../_internal';

export interface AppSession {
  activeSessionAddress: Address;
  host: string;
  sessions: Record<Address, ChainId | undefined>;
  url: string;
}

interface V0AppSession {
  host: string;
  chainId: number;
  address: Address;
  url: string;
}

export type ActiveSession = { address: Address; chainId: ChainId } | null;

export interface AppSessionsStore {
  appSessions: Record<string, AppSession | undefined>;
  getActiveSession: ({ host }: { host: string }) => ActiveSession;
  removeAddressSessions: ({ address }: { address: Address }) => void;
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
  }) => Record<Address, ChainId>;
  removeSession: ({
    host,
    address,
  }: {
    host: string;
    address: Address;
  }) => { address: Address; chainId: number } | null;
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

export const useAppSessionsStore = createBaseStore<AppSessionsStore>(
  (set, get) => ({
    appSessions: {},
    getActiveSession: ({ host }) => {
      const appSessions = get().appSessions;
      const activeSessionAddress = appSessions[host]?.activeSessionAddress;
      const sessions = appSessions[host]?.sessions;
      if (!activeSessionAddress || !sessions) return null;
      const chainId = sessions[activeSessionAddress];
      if (chainId === undefined) return null;
      return {
        address: activeSessionAddress,
        chainId,
      };
    },
    removeAddressSessions: ({ address }) => {
      set((state) => {
        const updatedAppSessions: Record<string, AppSession | undefined> = {};
        for (const [host, session] of Object.entries(state.appSessions)) {
          if (!session || !session.sessions[address]) {
            updatedAppSessions[host] = session;
            continue;
          }
          const { [address]: _, ...updatedSessions } = session.sessions;
          if (session.activeSessionAddress !== address) {
            updatedAppSessions[host] = {
              ...session,
              sessions: updatedSessions,
            };
            continue;
          }
          const newActiveSessionAddress = Object.keys(updatedSessions)[0];
          if (newActiveSessionAddress) {
            updatedAppSessions[host] = {
              ...session,
              sessions: updatedSessions,
              activeSessionAddress: newActiveSessionAddress as Address,
            };
          }
        }
        return { appSessions: updatedAppSessions };
      });
    },
    addSession: ({ host, address, chainId, url }) => {
      let result: Record<Address, ChainId>;
      set((state) => {
        const existingSession = state.appSessions[host];
        const updatedSessions = {
          ...existingSession?.sessions,
          [address]: chainId,
        };
        const newSession: AppSession = {
          host,
          url: existingSession?.url ?? url,
          sessions: updatedSessions,
          activeSessionAddress: address,
        };
        result = Object.fromEntries(
          Object.entries(updatedSessions).filter(
            ([, value]) => value !== undefined,
          ),
        ) as Record<Address, ChainId>;
        return {
          appSessions: {
            ...state.appSessions,
            [host]: newSession,
          },
        };
      });
      return result!;
    },
    removeAppSession: ({ host }) => {
      set((state) => {
        const { [host]: _, ...appSessions } = state.appSessions;
        return { appSessions };
      });
    },
    removeSession: ({ host, address }) => {
      let newActiveSession: { address: Address; chainId: number } | null = null;
      set((state) => {
        const appSession = state.appSessions[host];
        if (!appSession) return state;
        const sessionKeys = Object.keys(appSession.sessions);
        if (sessionKeys.length === 1) {
          const { [host]: _, ...appSessions } = state.appSessions;
          return { appSessions };
        }
        const { [address]: _, ...updatedSessions } = appSession.sessions;
        const newActiveSessionAddress = Object.keys(
          updatedSessions,
        )[0] as Address;
        const chainId = updatedSessions[newActiveSessionAddress];
        if (chainId !== undefined) {
          newActiveSession = {
            address: newActiveSessionAddress,
            chainId,
          };
          return {
            appSessions: {
              ...state.appSessions,
              [host]: {
                ...appSession,
                sessions: updatedSessions,
                activeSessionAddress: newActiveSessionAddress,
              },
            },
          };
        }
        return state;
      });
      return newActiveSession;
    },
    updateActiveSession: ({ host, address }) => {
      set((state) => {
        const appSession = state.appSessions[host];
        if (!appSession) return state;
        return {
          appSessions: {
            ...state.appSessions,
            [host]: {
              ...appSession,
              activeSessionAddress: address,
            },
          },
        };
      });
    },
    updateActiveSessionChainId: ({ host, chainId }) => {
      set((state) => {
        const appSession = state.appSessions[host];
        if (!appSession) return state;
        return {
          appSessions: {
            ...state.appSessions,
            [host]: {
              ...appSession,
              sessions: {
                ...appSession.sessions,
                [appSession.activeSessionAddress]: chainId,
              },
            },
          },
        };
      });
    },
    updateSessionChainId: ({ host, address, chainId }) => {
      set((state) => {
        const appSession = state.appSessions[host];
        if (!appSession) return state;
        return {
          appSessions: {
            ...state.appSessions,
            [host]: {
              ...appSession,
              sessions: {
                ...appSession.sessions,
                [address]: chainId,
              },
            },
          },
        };
      });
    },
    clearSessions: () => set({ appSessions: {} }),
  }),
  createExtensionStoreOptions({
    storageKey: 'appSessions',
    version: 1,
    migrate(persistedState, version) {
      if (version === 0) {
        const v0PersistedState = persistedState as {
          appSessions: Record<string, V0AppSession>;
        };
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
        } as AppSessionsStore;
      }
      return persistedState as AppSessionsStore;
    },
  }),
);
