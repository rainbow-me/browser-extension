import { Chain, zora } from 'viem/chains';
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

const mergeNewOfficiallySupportedChainsState = (
  state: RainbowChainsState,
  newChains: ChainId[],
) => {
  const officiallySupportedRainbowChains = getInitialRainbowChains();
  for (const chainId of newChains) {
    const officalConfig = officiallySupportedRainbowChains[chainId];
    const stateChain = state.rainbowChains[chainId];
    // if the rpc already exists in the state, merge the chains
    // else add the new rpc config to the state
    if (stateChain.chains.length > 0) {
      state.rainbowChains[chainId].chains = stateChain.chains.concat(
        officalConfig.chains,
      );
    } else {
      state.rainbowChains[chainId] = officalConfig;
    }
  }
  return state;
};

const removeCustomRPC = ({
  state,
  rpcUrl,
  rainbowChains,
}: {
  state: RainbowChainsState;
  rpcUrl: string;
  rainbowChains: Record<number, RainbowChain>;
}) => {
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
  state.rainbowChains = updatedrainbowChains;

  return state;
};

const addCustomRPC = ({
  state,
  chain,
}: {
  state: RainbowChainsState;
  chain: Chain;
}) => {
  const rainbowChains = state.rainbowChains;
  const rainbowChain = rainbowChains[chain.id] || {
    chains: [],
    activeRpcUrl: '',
  };
  rainbowChain.chains.push(chain);
  rainbowChain.activeRpcUrl = chain.rpcUrls.default.http[0];
  state.rainbowChains = { ...rainbowChains, [chain.id]: rainbowChain };
  return state;
};

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
    persist: {
      name: 'rainbowChains',
      version: 6,
      migrate(persistedState, version) {
        const state = persistedState as RainbowChainsState;
        if (version === 1) {
          // version 2 added support for Avalanche and Avalanche Fuji
          return mergeNewOfficiallySupportedChainsState(state, [
            ChainId.avalanche,
            ChainId.avalancheFuji,
          ]);
        }
        if (version === 2) {
          // version 2 added support for Blast
          return mergeNewOfficiallySupportedChainsState(state, [ChainId.blast]);
        }

        if (version === 3) {
          return removeCustomRPC({
            state,
            rpcUrl: 'https://rpc.zora.co',
            rainbowChains: state.rainbowChains,
          });
        }

        if (version === 4) {
          // version 5 added support for Degen
          return mergeNewOfficiallySupportedChainsState(state, [ChainId.degen]);
        }

        if (version === 5) {
          if (
            !state.rainbowChains[zora.id] ||
            state.rainbowChains[zora.id]?.chains.length === 0
          ) {
            return addCustomRPC({ chain: zora, state });
          }
        }

        return state;
      },
    },
  },
);

export const useRainbowChainsStore = create(rainbowChainsStore);
