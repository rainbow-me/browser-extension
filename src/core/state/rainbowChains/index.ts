import { Chain } from '@wagmi/chains';
import create from 'zustand';

import { SUPPORTED_CHAINS, getDefaultRPC } from '~/core/references';
import {
  ChainId,
  chainHardhat,
  chainHardhatOptimism,
} from '~/core/types/chains';

import { createStore } from '../internal/createStore';

export interface RainbowChain {
  activeRpcUrl: string;
  chains: Chain[];
}

export interface rainbowChainstate {
  rainbowChains: Record<number, RainbowChain>;
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

const IS_TESTING = process.env.IS_TESTING === 'true';

export const RAINBOW_CHAINS_SUPPORTED = IS_TESTING
  ? SUPPORTED_CHAINS.concat(chainHardhat, chainHardhatOptimism)
  : SUPPORTED_CHAINS;

const getInitialRainbowChains = () => {
  const rainbowChains: Record<number, RainbowChain> = {};
  RAINBOW_CHAINS_SUPPORTED.forEach((chain) => {
    const rpcUrl =
      getDefaultRPC(chain.id)?.http || chain.rpcUrls.default.http[0];
    const rnbwChain = {
      ...chain,
      rpcUrls: {
        default: { http: [rpcUrl] },
        public: { http: [rpcUrl] },
      },
    };
    rainbowChains[chain.id] = {
      activeRpcUrl: rpcUrl,
      chains: [rnbwChain],
    };
  });
  return rainbowChains;
};

export const rainbowChainsStore = createStore<rainbowChainstate>(
  (set, get) => ({
    rainbowChains: getInitialRainbowChains(),
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
    persist: {
      name: 'rainbowChains',
      version: 0,
    },
  },
);

export const useRainbowChainsStore = create(rainbowChainsStore);
