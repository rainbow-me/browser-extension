import { Chain } from 'viem/chains';

import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { ChainId } from '~/core/types/chains';

import { runNetworksMigrationIfNeeded } from '../networks/migration';
const IS_TESTING = process.env.IS_TESTING === 'true';

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

/**
 * @deprecated use `useNetworkStore` instead
 */
export const useRainbowChainsStore = createRainbowStore<RainbowChainsState>(
  (set, get) => ({
    rainbowChains: {},
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
    storageKey: 'rainbowChains',
    version: 13,
    onRehydrateStorage: () => {
      return (_, error) => {
        if (!error && !IS_TESTING) {
          runNetworksMigrationIfNeeded('rainbowChains');
        }
      };
    },
  },
);
