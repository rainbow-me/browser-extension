import create from 'zustand';

import { useBackendNetworksStore } from '~/core/state/backendNetworks/backendNetworks';
import { createStore } from '~/core/state/internal/createStore';
import { withSelectors } from '~/core/state/internal/withSelectors';
import { ChainId } from '~/core/types/chains';
import { persistOptions } from '~/core/utils/persistOptions';

export interface UserChainsState {
  /**
   * Mainnet chains in network settings
   */
  userChains: Record<ChainId, boolean>;
  /**
   * Mainnet chains ordered from network settings
   */
  userChainsOrder: ChainId[];
  updateUserChain: ({
    chainId,
    enabled,
  }: {
    chainId: ChainId;
    enabled: boolean;
  }) => void;
  updateUserChains: ({
    chainIds,
    enabled,
  }: {
    chainIds: ChainId[];
    enabled: boolean;
  }) => void;
  updateUserChainsOrder: ({
    userChainsOrder,
  }: {
    userChainsOrder: ChainId[];
  }) => void;
  addUserChain: ({ chainId }: { chainId: ChainId }) => void;
  removeUserChain: ({ chainId }: { chainId: ChainId }) => void;
}

const initialChains = () => {
  const supportedChainIds = useBackendNetworksStore
    .getState()
    .getSupportedChainIds();
  return supportedChainIds.reduce(
    (acc, chainId) => ({
      ...acc,
      [chainId]: true,
    }),
    {} as Record<ChainId, boolean>,
  );
};

const initialUserChainsOrder = () => {
  const supportedMainnetChainIds = useBackendNetworksStore
    .getState()
    .getSupportedMainnetChainIds();
  return supportedMainnetChainIds;
};

export const userChainsStore = createStore<UserChainsState>(
  (set, get) => ({
    userChains: initialChains(),
    userChainsOrder: initialUserChainsOrder(),
    updateUserChains: ({ chainIds, enabled }) => {
      const { userChains } = get();
      const chainsUpdated = chainIds.reduce(
        (acc, chainId) => {
          acc[chainId] = enabled;
          return acc;
        },
        {} as Record<ChainId, boolean>,
      ) satisfies Record<ChainId, boolean>;
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
    persist: persistOptions({
      name: 'userChains',
      version: 6,
      migrations: [
        // previous naive migrations reset user custom networks and ordering
        function v1(state: UserChainsState) {
          return {
            ...state,
            userChains: initialChains(),
            userChainsOrder: initialUserChainsOrder(),
          };
        },

        function v2(state: UserChainsState) {
          return {
            ...state,
            userChains: initialChains(),
            userChainsOrder: initialUserChainsOrder(),
          };
        },

        function v3(state: UserChainsState) {
          return {
            ...state,
            userChains: initialChains(),
            userChainsOrder: initialUserChainsOrder(),
          };
        },

        function v4(state: UserChainsState) {
          return {
            ...state,
            userChains: initialChains(),
            userChainsOrder: initialUserChainsOrder(),
          };
        },

        // v5 adds apechain support
        function v5(state: UserChainsState) {
          // previous october migration #1738 inadvertenly reset state
          // this will only apply to users who have not yet migrated to v5
          return {
            ...state,
            userChains: { ...state.userChains, [ChainId.apechain]: true },
            userChainsOrder: state.userChainsOrder.includes(ChainId.apechain)
              ? state.userChainsOrder
              : [...state.userChainsOrder, ChainId.apechain],
          };
        },

        // v6 adds apechainCurtis, ink, inkSepolia support
        function v6(state: UserChainsState) {
          const newChains = [
            ChainId.apechainCurtis,
            ChainId.ink,
            ChainId.inkSepolia,
          ];
          return {
            ...state,
            userChains: {
              ...state.userChains,
              ...Object.fromEntries(newChains.map((id) => [id, true])),
            },
            userChainsOrder: state.userChainsOrder.concat(
              newChains.filter((id) => !state.userChainsOrder.includes(id)),
            ),
          };
        },
      ],
    }),
  },
);

export const useUserChainsStore = withSelectors(create(userChainsStore));
