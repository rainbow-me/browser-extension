import create from 'zustand';

import { SUPPORTED_MAINNET_CHAINS } from '~/core/references';
import { ChainId } from '~/core/types/chains';

import { createStore } from '../internal/createStore';

type MainnetChainId =
  | ChainId.mainnet
  | ChainId.optimism
  | ChainId.polygon
  | ChainId.arbitrum
  | ChainId.bsc
  | ChainId.zora
  | ChainId.base;

export interface UserChainsState {
  /**
   * Mainnet chains in network settings
   */
  userChains: Record<MainnetChainId, boolean>;
  /**
   * Mainnet chains ordered from network settings
   */
  userChainsOrder: MainnetChainId[];
  updateUserChain: ({
    chainId,
    enabled,
  }: {
    chainId: MainnetChainId;
    enabled: boolean;
  }) => void;
  updateUserChains: ({
    chainIds,
    enabled,
  }: {
    chainIds: MainnetChainId[];
    enabled: boolean;
  }) => void;
  updateUserChainsOrder: ({
    userChainsOrder,
  }: {
    userChainsOrder: (MainnetChainId | number)[];
  }) => void;
}

const chains = SUPPORTED_MAINNET_CHAINS.reduce(
  (acc, chain) => ({
    ...acc,
    [chain.id]: true,
  }),
  {} as Record<MainnetChainId, boolean>,
);

const userChainsOrder = Object.keys(chains).map(
  (id) => Number(id) as MainnetChainId,
);

export const userChainsStore = createStore<UserChainsState>(
  (set, get) => ({
    userChains: chains,
    userChainsOrder,
    updateUserChains: ({ chainIds, enabled }) => {
      const { userChains } = get();
      const chainsUpdated = chainIds.reduce(
        (acc, chainId) => {
          acc[chainId] = enabled;
          return acc;
        },
        {} as Record<MainnetChainId, boolean>,
      ) satisfies Record<MainnetChainId, boolean>;
      set({
        userChains: {
          ...userChains,
          ...chainsUpdated,
        },
      });
    },
    updateUserChain: ({ chainId, enabled }) => {
      const { userChains } = get();
      set({
        userChains: {
          ...userChains,
          [chainId]: enabled,
        },
      });
    },
    updateUserChainsOrder: ({ userChainsOrder }) => {
      set({
        userChainsOrder,
      });
    },
  }),
  {
    persist: {
      name: 'userChains',
      version: 1,
    },
  },
);

export const useUserChainsStore = create(userChainsStore);
