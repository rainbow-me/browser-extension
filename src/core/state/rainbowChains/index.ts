import { Chain, degen, zora } from 'viem/chains';
import create from 'zustand';

import { ChainId } from '~/core/types/chains';
import { persistOptions } from '~/core/utils/persistOptions';

import { createStore } from '../internal/createStore';
import { withSelectors } from '../internal/withSelectors';

import {
  addCustomRPC,
  getInitialRainbowChains,
  mergeNewOfficiallySupportedChainsState,
  removeCustomRPC,
} from './utils';

export interface BackendChain {
  chainID: string;
  id: string;
  name: string;
  label: string;
  icons: {
    badgeURL: string;
  };
  testnet: boolean;
  opStack: boolean;
  defaultExplorer: {
    url: string;
    label: string;
    transactionURL: string;
    tokenURL: string;
  };
  defaultRPC: {
    enabledDevices: string[];
    url: string;
  };
  nativeAsset: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    iconURL: string;
    colors: {
      primary: string;
      fallback: string;
      shadow: string;
    };
  };
  nativeWrappedAsset: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    iconURL: string;
    colors: {
      primary: string;
      fallback: string;
      shadow: string;
    };
  };
  enabledServices: {
    gas: {
      enabled: boolean;
      eip1559Enabled: boolean;
      legacyEnabled: boolean;
    };
    trade: {
      swapping: boolean;
      bridging: boolean;
    };
    wallet: {
      approvals: boolean;
      transactions: boolean;
      balance: boolean;
      summary: boolean;
      defiPositions: boolean;
      hasActivity: boolean;
    };
    token: {
      tokenSearch: boolean;
      nftProxy: boolean;
    };
  };
}

export interface RainbowChain {
  activeRpcUrl: string;
  chains: Chain[];
}

export interface RainbowChainsState {
  rainbowChains: Record<number, RainbowChain>;
  getActiveChain: ({ chainId }: { chainId: number }) => Chain | undefined;
  addCustomRPC: ({ chain }: { chain: Chain }) => boolean;
  updateCustomRPC: ({ chain }: { chain: Chain }) => void;
  setActiveRPC: ({
    rpcUrl,
    chainId,
  }: {
    rpcUrl?: string;
    chainId: ChainId;
  }) => void;
  removeCustomRPC: ({ rpcUrl }: { rpcUrl: string }) => void;
}

export const rainbowChainsStore = createStore<RainbowChainsState>(
  (set, get) => ({
    rainbowChains: getInitialRainbowChains(),
    getActiveChain: ({ chainId }) => {
      const rainbowChains = get().rainbowChains;
      const rainbowChain = rainbowChains[chainId];
      const chain = rainbowChain?.chains?.find(
        (chain) => chain.rpcUrls.default.http[0] === rainbowChain.activeRpcUrl,
      );
      return chain;
    },
    addCustomRPC: ({ chain }) => {
      const rainbowChains = get().rainbowChains;
      const rainbowChain = rainbowChains[chain.id] || {
        chains: [],
        activeRpcUrl: '',
      };
      const currentRpcs = rainbowChain.chains.map(
        (chain) => chain.rpcUrls.default.http[0],
      );
      if (!currentRpcs.includes(chain.rpcUrls.default.http[0])) {
        rainbowChain.chains.push(chain);
        if (!rainbowChain.activeRpcUrl)
          rainbowChain.activeRpcUrl = chain.rpcUrls.default.http[0];
        set({
          rainbowChains: { ...rainbowChains, [chain.id]: rainbowChain },
        });
        return true;
      } else {
        return false;
      }
    },
    updateCustomRPC: ({ chain }) => {
      const rainbowChains = get().rainbowChains;
      const rainbowChain = rainbowChains[chain.id];
      const index = rainbowChain?.chains.findIndex(
        (rpc) => rpc.rpcUrls.default === chain.rpcUrls.default,
      );
      if (index !== -1) {
        rainbowChain.chains[index] = chain;
        set({
          rainbowChains: { ...rainbowChains, [chain.id]: rainbowChain },
        });
      }
    },
    setActiveRPC: ({ rpcUrl, chainId }) => {
      const rainbowChains = get().rainbowChains;
      const rainbowChain = rainbowChains[chainId];
      if (rainbowChains) {
        rainbowChain.activeRpcUrl = rpcUrl || '';
        set({
          rainbowChains: { ...rainbowChains, [chainId]: rainbowChain },
        });
      }
    },
    removeCustomRPC: ({ rpcUrl }) => {
      const rainbowChains = get().rainbowChains;
      const updatedrainbowChains = { ...rainbowChains };

      Object.entries(rainbowChains).forEach(([chainId, rainbowChains]) => {
        const index = rainbowChains.chains.findIndex((chain) =>
          chain.rpcUrls.default.http.includes(rpcUrl),
        );
        if (index !== -1) {
          rainbowChains.chains.splice(index, 1);

          // If deleted RPC was active, reset activeRpcUrl or set to another RPC if available
          if (rainbowChains.activeRpcUrl === rpcUrl) {
            rainbowChains.activeRpcUrl =
              rainbowChains.chains[0]?.rpcUrls.default.http[0] || '';
          }

          // Remove the chain if no RPCs are left
          if (!rainbowChains.chains.length) {
            delete updatedrainbowChains[Number(chainId)];
          } else {
            updatedrainbowChains[Number(chainId)] = rainbowChains;
          }
        }
      });

      set({ rainbowChains: updatedrainbowChains });
    },
  }),
  {
    persist: persistOptions({
      name: 'rainbowChains',
      version: 8,
      migrations: [
        // v1 didn't need a migration
        function v1(s: RainbowChainsState) {
          return s;
        },

        // version 2 added support for Avalanche and Avalanche Fuji
        function v2(state) {
          return mergeNewOfficiallySupportedChainsState(state, [
            ChainId.avalanche,
            ChainId.avalancheFuji,
          ]);
        },

        // version 3 added support for Blast
        function v3(state) {
          return mergeNewOfficiallySupportedChainsState(state, [ChainId.blast]);
        },

        function v4(state) {
          return removeCustomRPC({
            state,
            rpcUrl: 'https://rpc.zora.co',
            rainbowChains: state.rainbowChains,
          });
        },

        // version 5 added support for Degen
        function v5(state) {
          return mergeNewOfficiallySupportedChainsState(state, [ChainId.degen]);
        },

        function v6(state) {
          if (
            !state.rainbowChains[zora.id] ||
            state.rainbowChains[zora.id]?.chains.length === 0
          ) {
            return addCustomRPC({ chain: zora, state });
          }
          return state;
        },

        function v7(state) {
          return state;
        },

        function v8(state) {
          if (
            !state.rainbowChains[degen.id] ||
            state.rainbowChains[degen.id]?.chains.length === 0
          ) {
            return addCustomRPC({ chain: degen, state });
          }
          return state;
        },
      ],
    }),
  },
);

export const useRainbowChainsStore = withSelectors(create(rainbowChainsStore));
