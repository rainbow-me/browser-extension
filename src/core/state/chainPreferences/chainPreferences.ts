import { create } from 'zustand';

import { createStore } from '~/core/state/internal/createStore';
import { withSelectors } from '~/core/state/internal/withSelectors';
import { ChainId } from '~/core/types/chains';

import { RainbowChain, useRainbowChainsStore } from '../rainbowChains';
import { useUserChainsStore } from '../userChains';

export type CustomRPC = {
  networkName: string;
  rpcUrl: string;
  symbol: string;
  blockExplorerUrl: string;
  isActive: boolean;
  testnet?: boolean;
};

export interface ChainPreferencesState {
  chainOrder: ChainId[];
  enabledChains: Partial<Record<ChainId, boolean>>;
  customRPCs: Partial<Record<ChainId, Record<string, CustomRPC>>>; // mapping of chainId to rpcUrl to customRPC

  getActiveRPCForChainId: ({
    chainId,
  }: {
    chainId: ChainId;
  }) => string | undefined;

  updateChainOrder: ({ chainOrder }: { chainOrder: ChainId[] }) => void;

  updateEnabledChains: ({
    chainIds,
    enabled,
  }: {
    chainIds: ChainId[];
    enabled: boolean;
  }) => void;

  addCustomRPC: ({
    chainId,
    data,
  }: {
    chainId: ChainId;
    data: CustomRPC;
  }) => void;
  updateCustomRPC: ({
    chainId,
    data,
  }: {
    chainId: ChainId;
    data: CustomRPC;
  }) => void;
  removeCustomRPC: ({
    chainId,
    rpcUrl,
  }: {
    chainId: ChainId;
    rpcUrl: string;
  }) => void;
}

export const chainPreferencesStore = createStore<ChainPreferencesState>(
  (set, get) => ({
    chainOrder: [],
    enabledChains: {},
    customChains: {},
    customRPCs: {},

    getActiveRPCForChainId: ({ chainId }) => {
      const { customRPCs } = get();
      const chainRPCs = customRPCs[chainId] || {};
      return Object.values(chainRPCs).find((rpc) => rpc.isActive)?.rpcUrl;
    },

    updateChainOrder: ({ chainOrder }) => {
      set({ chainOrder });
    },

    updateEnabledChains: ({ chainIds, enabled }) => {
      const { enabledChains } = get();
      const chainsUpdated = chainIds.reduce(
        (acc, chainId) => {
          acc[chainId] = enabled;
          return acc;
        },
        {} as Record<ChainId, boolean>,
      );
      set({ enabledChains: { ...enabledChains, ...chainsUpdated } });
    },

    addCustomRPC: ({ chainId, data }) => {
      const { customRPCs, getActiveRPCForChainId } = get();
      const updatedCustomRPCs = { ...customRPCs };
      const chainRPCs = updatedCustomRPCs[chainId] || {};
      chainRPCs[data.rpcUrl] = data;

      // if we're activating the RPC, deactivate the last active one
      if (data.isActive) {
        const currActiveRPC = getActiveRPCForChainId({ chainId });
        if (currActiveRPC) {
          chainRPCs[currActiveRPC].isActive = false;
        }
      }

      set({ customRPCs: updatedCustomRPCs });
    },

    updateCustomRPC: ({ chainId, data }) => {
      const { customRPCs } = get();
      const updatedCustomRPCs = { ...customRPCs };
      const chainRPCs = updatedCustomRPCs[chainId] || {};
      chainRPCs[data.rpcUrl] = data;
      set({ customRPCs: updatedCustomRPCs });
    },

    removeCustomRPC: ({ chainId, rpcUrl }) => {
      const { customRPCs } = get();
      const updatedCustomRPCs = { ...customRPCs };
      const chainRPCs = updatedCustomRPCs[chainId] || {};
      delete chainRPCs[rpcUrl];

      if (Object.keys(chainRPCs).length === 0) {
        delete updatedCustomRPCs[chainId];
      }

      set({ customRPCs: updatedCustomRPCs });
    },
  }),
  {
    persist: {
      version: 1,
      name: 'chainPreferences',
      merge: (persistedState, currentState) => {
        if (!persistedState) {
          // If chainOrder is empty, populate it from userChainsStore
          if (currentState.chainOrder.length === 0) {
            const userChainsOrder = useUserChainsStore.use.userChainsOrder();

            currentState.chainOrder = userChainsOrder;
          }

          // If enabledChains is empty, populate it from userChainsStore
          if (Object.keys(currentState.enabledChains).length === 0) {
            currentState.enabledChains = {
              ...useUserChainsStore.use.userChains(),
            };
          }

          // If customRPCs is empty, populate it from rainbowChainsStore
          if (Object.keys(currentState.customRPCs).length === 0) {
            const rainbowChains = useRainbowChainsStore.use.rainbowChains();
            currentState.customRPCs = convertChainsToCustomRPCs(rainbowChains);
          }

          return currentState;
        }
        return { ...currentState, ...persistedState };
      },
    },
  },
);

function convertChainsToCustomRPCs(
  rainbowChains: Record<number, RainbowChain>,
): Partial<Record<ChainId, Record<string, CustomRPC>>> {
  const customRPCs: Partial<Record<ChainId, Record<string, CustomRPC>>> = {};

  for (const chainId of Object.keys(rainbowChains)) {
    const chainIdNumber = +chainId;
    const chains = Object.values(rainbowChains)[chainIdNumber];
    if (!chains.chains.length) {
      continue;
    }

    if (!customRPCs[chainIdNumber]) {
      customRPCs[chainIdNumber] = {};
    }

    const rpcsForChainId = customRPCs[chainIdNumber] || {};
    for (const chainsForChainId of chains.chains) {
      rpcsForChainId[chainsForChainId.rpcUrls.default.http[0]] = {
        isActive:
          chains.activeRpcUrl === chainsForChainId.rpcUrls.default.http[0],
        blockExplorerUrl: chainsForChainId.blockExplorers?.default?.url ?? '',
        networkName: chainsForChainId.name,
        rpcUrl: chainsForChainId.rpcUrls.default.http[0],
        symbol: chainsForChainId.nativeCurrency.symbol,
        testnet: chainsForChainId.testnet,
      };
    }
    customRPCs[chainIdNumber] = rpcsForChainId;
  }
  return customRPCs;
}

export const useChainPreferencesStore = withSelectors(
  create(chainPreferencesStore),
);
