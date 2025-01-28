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
  replaceChainsWithInitial,
} from './utils';

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
      version: 12,
      migrations: [
        // v1 didn't need a migration
        function v1(s: RainbowChainsState) {
          return s;
        },

        // version 2 added support for Avalanche and Avalanche Fuji
        function v2(state) {
          const rnbwChainState = state as RainbowChainsState;
          return mergeNewOfficiallySupportedChainsState(rnbwChainState, [
            ChainId.avalanche,
            ChainId.avalancheFuji,
          ]);
        },

        // version 3 added support for Blast
        function v3(state: unknown) {
          const rnbwChainState = state as RainbowChainsState;
          return mergeNewOfficiallySupportedChainsState(rnbwChainState, [
            ChainId.blast,
          ]);
        },

        function v4(state: unknown) {
          const rnbwChainState = state as RainbowChainsState;
          return removeCustomRPC({
            state: rnbwChainState,
            rpcUrl: 'https://rpc.zora.co',
            rainbowChains: rnbwChainState.rainbowChains,
          });
        },

        // version 5 added support for Degen
        function v5(state: unknown) {
          const rnbwChainState = state as RainbowChainsState;
          return mergeNewOfficiallySupportedChainsState(rnbwChainState, [
            ChainId.degen,
          ]);
        },

        // version 6 added support for Zora
        function v6(state: unknown) {
          const rnbwChainState = state as RainbowChainsState;
          if (
            !rnbwChainState.rainbowChains[zora.id] ||
            rnbwChainState.rainbowChains[zora.id]?.chains.length === 0
          ) {
            return addCustomRPC({ chain: zora, state: rnbwChainState });
          }
          return state;
        },

        function v7(state: unknown) {
          return state;
        },

        // version 8 added support for Degen
        function v8(state: unknown) {
          const rnbwChainState = state as RainbowChainsState;
          if (
            !rnbwChainState.rainbowChains[degen.id] ||
            rnbwChainState.rainbowChains[degen.id]?.chains.length === 0
          ) {
            return addCustomRPC({
              chain: degen,
              state: state as RainbowChainsState,
            });
          }
          return state;
        },

        // This migration intended to resolve issues where we
        // inadvertently added RPCs supplied by the dApp provider
        // (i.e. Wagmi add network calls) that replaced the default
        // RPCs for our supported chains.
        function v9(state: unknown) {
          return replaceChainsWithInitial(state as RainbowChainsState);
        },

        // The previous version of this migration #1738 returned
        // `getInitialRainbowChains` which reset user custom networks,
        // RPCs, and active status toggles for all chains.
        // Now we merge Apechain into the default chains for users
        // that haven't yet migrated to v10.
        function v10(state: unknown) {
          const rnbwChainState = state as RainbowChainsState;
          return mergeNewOfficiallySupportedChainsState(rnbwChainState, [
            ChainId.apechain,
            // not adding `apechainCurtis` because most users already migrated
          ]);
        },

        // version 11 added support for Ink and fixed `apechainCurtis`
        function v11(state: unknown) {
          const rnbwChainState = state as RainbowChainsState;
          return mergeNewOfficiallySupportedChainsState(rnbwChainState, [
            ChainId.apechainCurtis,
            ChainId.ink,
            ChainId.inkSepolia,
          ]);
        },

        // version 12 added support for Sanko and Gnosis
        function v12(state: unknown) {
          const rnbwChainState = state as RainbowChainsState;
          return mergeNewOfficiallySupportedChainsState(rnbwChainState, [
            ChainId.sanko,
            ChainId.sankoTestnet,
            ChainId.gnosis,
            ChainId.gnosisChiado,
          ]);
        },
      ],
    }),
  },
);

export const useRainbowChainsStore = withSelectors(create(rainbowChainsStore));
