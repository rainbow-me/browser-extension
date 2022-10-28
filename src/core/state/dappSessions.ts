import create from 'zustand';

import { createStore } from './internal/createStore';

export type EthereumAddress = `0x${string}`;
export interface DappSessionsStore {
  dappSessions: { url: string; address: EthereumAddress; chainId: number }[];
  isActiveSession: (hostUrl?: string) => boolean;
  addSession: (
    hostUrl: string,
    address: EthereumAddress,
    chainId: number,
  ) => void;
  updateSessionChainId: (hostUrl: string, chainId: number) => void;
  updateSessionAddress: (hostUrl: string, address: EthereumAddress) => void;
  clearSessions: () => void;
}
export const dappSessionsStore = createStore<DappSessionsStore>(
  (set, get) => ({
    dappSessions: [],
    isActiveSession: (hostUrl) => {
      const dappSessions = get().dappSessions;
      return !!hostUrl && !!dappSessions.find((host) => host.url === hostUrl);
    },
    addSession: (hostUrl, address, chainId) => {
      const dappSessions = get().dappSessions;
      set({
        dappSessions: dappSessions.concat([{ url: hostUrl, address, chainId }]),
      });
    },
    updateSessionChainId: (hostUrl, chainId) => {
      const dappSessions = get().dappSessions;
      const newSessions = dappSessions.map((session) => {
        if (session.url === hostUrl) {
          return { ...session, chainId };
        }
        return session;
      });
      set({
        dappSessions: newSessions,
      });
    },
    updateSessionAddress: (hostUrl, address) => {
      const dappSessions = get().dappSessions;
      const newSessions = dappSessions.map((session) => {
        if (session.url === hostUrl) {
          return { ...session, address };
        }
        return session;
      });
      set({
        dappSessions: newSessions,
      });
    },
    clearSessions: () => set({ dappSessions: [] }),
  }),
  {
    persist: {
      name: 'dappSessions',
      version: 0,
    },
  },
);

export const useDappSessionsStore = create(dappSessionsStore);
