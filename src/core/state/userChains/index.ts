import create from 'zustand';

import { ChainId } from '~/core/types/chains';

import { createStore } from '../internal/createStore';
import { withSelectors } from '../internal/withSelectors';

export interface UserChainsState {
  /**
   * Mainnet chains in network settings
   */
  userChains: Record<number, boolean>;
  /**
   * Mainnet chains ordered from network settings
   */
  userChainsOrder: (number | number)[];
  updateUserChain: ({
    chainId,
    enabled,
  }: {
    chainId: number;
    enabled: boolean;
  }) => void;
  updateUserChains: ({
    chainIds,
    enabled,
  }: {
    chainIds: number[];
    enabled: boolean;
  }) => void;
  updateUserChainsOrder: ({
    userChainsOrder,
  }: {
    userChainsOrder: (number | number)[];
  }) => void;
  addUserChain: ({ chainId }: { chainId: ChainId }) => void;
  removeUserChain: ({ chainId }: { chainId: ChainId }) => void;
}

export const userChainsStore = createStore<UserChainsState>(
  (set, get) => ({
    userChains: {},
    userChainsOrder: [],
    updateUserChains: ({ chainIds, enabled }) => {
      const { userChains } = get();
      const chainsUpdated = chainIds.reduce(
        (acc, chainId) => {
          acc[chainId] = enabled;
          return acc;
        },
        {} as Record<number, boolean>,
      ) satisfies Record<number, boolean>;
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
    addUserChain: ({ chainId }) => {
      const { userChains, userChainsOrder } = get();
      set({
        userChains: {
          ...userChains,
          [chainId]: true,
        },
        userChainsOrder: userChainsOrder.concat([chainId]),
      });
    },
    removeUserChain: ({ chainId }) => {
      const { userChains, userChainsOrder } = get();
      delete userChains[chainId];
      const position = userChainsOrder.findIndex((id) => chainId === id);
      if (position !== -1) {
        userChainsOrder.splice(position, 1);
      }
      set({
        userChains: {
          ...userChains,
        },
        userChainsOrder,
      });
    },
  }),
  {
    persist: {
      name: 'userChains',
      version: 7,
    },
  },
);

export const useUserChainsStore = withSelectors(create(userChainsStore));
