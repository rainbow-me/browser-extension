import {
  Chain,
  arbitrum,
  base,
  bsc,
  optimism,
  polygon,
  zora,
} from '@wagmi/chains';
import { mainnet } from 'wagmi';
import create from 'zustand';

import { getDefaultRPC } from '~/core/references';
import { ChainId } from '~/core/types/chains';

import { createStore } from '../internal/createStore';

export interface CustomChain {
  activeRpcUrl: string;
  chains: Chain[];
}

export interface CustomRPCsState {
  customChains: Record<number, CustomChain>;
  addCustomRPC: ({ chain }: { chain: Chain }) => boolean;
  updateCustomRPC: ({ chain }: { chain: Chain }) => void;
  setDefaultRPC: ({ chainId }: { chainId: ChainId }) => void;
  setActiveRPC: ({
    rpcUrl,
    chainId,
  }: {
    rpcUrl?: string;
    chainId: ChainId;
  }) => void;
  removeCustomRPC: ({ rpcUrl }: { rpcUrl: string }) => void;
}

const getInitialCustomChains = () => {
  const customChains: Record<number, CustomChain> = {};
  [mainnet, polygon, optimism, arbitrum, base, zora, bsc].forEach((chain) => {
    const rpcUrl = getDefaultRPC(chain.id)?.http || '';
    const rnbwChain = {
      ...chain,
      rpcUrls: {
        default: { http: [rpcUrl] },
        public: { http: [rpcUrl] },
      },
    };
    customChains[chain.id] = {
      activeRpcUrl: rpcUrl,
      chains: [rnbwChain],
    };
  });
  return customChains;
};

export const customRPCsStore = createStore<CustomRPCsState>(
  (set, get) => ({
    customChains: getInitialCustomChains(),
    addCustomRPC: ({ chain }) => {
      const customChains = get().customChains;
      const customChain = customChains[chain.id] || {
        chains: [],
        activeRpcUrl: '',
        blockExplorers: [],
      };
      const currentRpcs = customChain.chains.map(
        (chain) => chain.rpcUrls.default.http[0],
      );
      if (!currentRpcs.includes(chain.rpcUrls.default.http[0])) {
        customChain.chains.push(chain);
        if (!customChain.activeRpcUrl) {
          customChain.activeRpcUrl = chain.rpcUrls.default.http[0];
        }
        set({ customChains: { ...customChains, [chain.id]: customChain } });
        return true;
      } else {
        return false;
      }
    },
    updateCustomRPC: ({ chain }) => {
      const customChains = get().customChains;
      const customChain = customChains[chain.id];
      const index = customChain?.chains.findIndex(
        (rpc) => rpc.rpcUrls.default === chain.rpcUrls.default,
      );
      if (index !== -1) {
        customChain.chains[index] = chain;
        set({
          customChains: { ...customChains, [chain.id]: customChain },
        });
      }
    },
    setActiveRPC: ({ rpcUrl, chainId }) => {
      const customChains = get().customChains;
      const customChain = customChains[chainId];
      if (customChain) {
        customChain.activeRpcUrl = rpcUrl || '';
        set({ customChains: { ...customChains, [chainId]: customChain } });
      }
    },
    setDefaultRPC: ({ chainId }: { chainId: ChainId }) => {
      const customChains = get().customChains;
      const customChain = customChains[chainId];
      if (customChain) {
        customChain.activeRpcUrl = getDefaultRPC(chainId)?.http || '';
        set({ customChains: { ...customChains, [chainId]: customChain } });
      }
    },
    removeCustomRPC: ({ rpcUrl }) => {
      const customChains = get().customChains;
      const updatedCustomChains = { ...customChains };

      Object.entries(customChains).forEach(([chainId, customChain]) => {
        const index = customChain.chains.findIndex((chain) =>
          chain.rpcUrls.default.http.includes(rpcUrl),
        );
        if (index !== -1) {
          customChain.chains.splice(index, 1);

          // If deleted RPC was active, reset activeRpcUrl or set to another RPC if available
          if (customChain.activeRpcUrl === rpcUrl) {
            customChain.activeRpcUrl =
              customChain.chains[0]?.rpcUrls.default.http[0] || '';
          }

          // Remove the chain if no RPCs are left
          if (!customChain.chains.length) {
            delete updatedCustomChains[Number(chainId)];
          } else {
            updatedCustomChains[Number(chainId)] = customChain;
          }
        }
      });

      set({ customChains: updatedCustomChains });
    },
  }),
  {
    persist: {
      name: 'customRPCs',
      version: 1,
    },
  },
);

export const useCustomRPCsStore = create(customRPCsStore);
