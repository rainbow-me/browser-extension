import merge from 'lodash/merge';
import { Chain } from 'viem';

import buildTimeNetworks from 'static/data/networks.json';
import { fetchNetworks } from '~/core/resources/networks/networks';
import { favoritesStore } from '~/core/state/favorites';
import { createQueryStore } from '~/core/state/internal/createQueryStore';
import {
  LOCAL_NETWORKS,
  buildInitialUserPreferences,
  differenceOrUnionOf,
  mergeChainData,
  modifyUserPreferencesForNewlySupportedNetworks,
  toChainId,
} from '~/core/state/networks/utils';
import { AddressOrEth } from '~/core/types/assets';
import {
  BackendNetwork,
  ChainId,
  CustomNetwork,
  MergedChain,
  Networks,
  UserPreferences,
} from '~/core/types/chains';

const IS_DEV = process.env.IS_DEV === 'true';
const INTERNAL_BUILD = process.env.INTERNAL_BUILD === 'true';
const IS_TESTING = process.env.IS_TESTING === 'true';

const LOCAL_TESTING_NETWORKS = IS_TESTING ? LOCAL_NETWORKS : [];

export interface NetworkState {
  networks: Networks; // contains backend-driven networks and backend-driven custom networks
  userOverrides: Record<number, UserPreferences>; // contains user-driven overrides for backend-driven networks AND user added custom networks
}

interface NetworkActions {
  // user-added custom networks store methods
  getActiveRpcForChain: (chainId: number) => Chain | null;
  addCustomNetwork: (chainId: number, userPreferences: UserPreferences) => void;
  updateCustomNetwork: (
    chainId: number,
    userPreferences: Partial<UserPreferences>,
  ) => void;
  removeCustomNetwork: (chainId: number) => boolean;
  removeRpcFromNetwork: (
    chainId: number,
    rpcUrl: string,
  ) => {
    success: boolean;
    newRpcsLength: number;
  };

  // custom networks store methods
  getSupportedCustomNetworks: () => CustomNetwork[];
  getSupportedCustomNetworksIconUrls: () => Record<number, string>;
  getSupportedCustomNetworksTestnetFaucets: () => Record<number, string>;
  getSupportedCustomNetworkTestnetFaucet: (
    chainId: number,
  ) => string | undefined;

  // supported networks store methods
  getSupportedNetworks: (
    includeTestnets?: boolean,
  ) => Record<number, MergedChain>;
  getOrderSortedSupportedNetworks: (includeTestnets?: boolean) => MergedChain[];
  getSupportedNetwork: (chainId: number) => MergedChain | undefined;
  getSupportedNetworksIds: (includeTestnets?: boolean) => number[];
  getSupportedNetworksBadgeUrls: (
    includeTestnets?: boolean,
  ) => Record<number, string>;
  getSupportedNetworkBadgeUrl: (chainId: number) => string | undefined;
  getDefaultFavorites: () => Record<number, AddressOrEth[]>;
}

let lastNetworks: Networks | null = null;
let lastUserOverrides: Record<number, UserPreferences> | null = null;
let mergedChainData: Record<number, MergedChain> | null = null;

function createSelector<T>(
  selectorFn: ({
    networks,
    userOverrides,
    mergedChainData,
  }: {
    networks: Networks;
    userOverrides: Record<number, UserPreferences>;
    mergedChainData: Record<number, MergedChain>;
  }) => T,
): () => T {
  const uninitialized = Symbol();
  let cachedResult: T | typeof uninitialized = uninitialized;
  let memoizedFn:
    | ((params: {
        networks: Networks;
        userOverrides: Record<number, UserPreferences>;
        mergedChainData: Record<number, MergedChain>;
      }) => T)
    | null = null;

  return () => {
    const { networks, userOverrides } = networkStore.getState();

    const didNetworksChange = lastNetworks !== networks;
    const didUserOverridesChange = lastUserOverrides !== userOverrides;

    if (
      cachedResult !== uninitialized &&
      !didNetworksChange &&
      !didUserOverridesChange &&
      mergedChainData !== null
    ) {
      return cachedResult;
    }

    if (
      didNetworksChange ||
      didUserOverridesChange ||
      mergedChainData === null
    ) {
      if (didNetworksChange) lastNetworks = networks;
      if (didUserOverridesChange) lastUserOverrides = userOverrides;

      mergedChainData = mergeChainData(networks, userOverrides);
    }

    if (!memoizedFn) memoizedFn = selectorFn;

    cachedResult = memoizedFn({ networks, userOverrides, mergedChainData });
    return cachedResult;
  };
}

function createParameterizedSelector<T, Args extends unknown[]>(
  selectorFn: (params: {
    networks: Networks;
    userOverrides: Record<ChainId, UserPreferences>;
    mergedChainData: Record<number, MergedChain>;
  }) => (...args: Args) => T,
): (...args: Args) => T {
  const uninitialized = Symbol();
  let cachedResult: T | typeof uninitialized = uninitialized;
  let lastArgs: Args | null = null;
  let memoizedFn: ((...args: Args) => T) | null = null;

  return (...args: Args) => {
    const { networks, userOverrides } = networkStore.getState();
    const argsChanged =
      !lastArgs ||
      args.length !== lastArgs.length ||
      args.some((arg, i) => arg !== lastArgs?.[i]);

    const didNetworksChange = lastNetworks !== networks;
    const didUserOverridesChange = lastUserOverrides !== userOverrides;

    if (
      cachedResult !== uninitialized &&
      !didNetworksChange &&
      !didUserOverridesChange &&
      !argsChanged
    ) {
      return cachedResult;
    }

    if (
      !memoizedFn ||
      didNetworksChange ||
      didUserOverridesChange ||
      mergedChainData === null
    ) {
      if (didNetworksChange) lastNetworks = networks;
      if (didUserOverridesChange) lastUserOverrides = userOverrides;

      mergedChainData = mergeChainData(networks, userOverrides);
      memoizedFn = selectorFn({ networks, userOverrides, mergedChainData });
    }

    lastArgs = args;
    cachedResult = memoizedFn(...args);
    return cachedResult;
  };
}

const initialState: NetworkState = {
  networks: buildTimeNetworks,
  userOverrides: buildInitialUserPreferences(),
};

export const networkStore = createQueryStore<
  Networks,
  never,
  NetworkState & NetworkActions
>(
  {
    fetcher: fetchNetworks,
    setData: ({ data, set }) => {
      set((state) => {
        const newNetworks = differenceOrUnionOf({
          existing: state.networks.backendNetworks.networks,
          incoming: data.backendNetworks.networks,
        });

        if (newNetworks.size === 0) {
          return {
            ...state,
            networks: data,
          };
        }

        void syncDefaultFavoritesForNewlySupportedNetworks(newNetworks);

        return {
          ...state,
          networks: data,
          userOverrides: modifyUserPreferencesForNewlySupportedNetworks(
            state,
            newNetworks,
          ),
        };
      });
    },
    staleTime: 10 * 60 * 1000,
  },

  (set) => ({
    ...initialState,

    getActiveRpcForChain: createParameterizedSelector(({ mergedChainData }) => {
      return (chainId: number) => {
        const chain = mergedChainData[chainId];
        if (!chain) return null;
        return chain.rpcs[chain.activeRpcUrl];
      };
    }),

    addCustomNetwork: (chainId, userPreferences) => {
      set((state) => {
        const existing = state.userOverrides[chainId];
        if (existing) {
          return {
            ...state,
            userOverrides: {
              ...state.userOverrides,
              [chainId]: merge(existing, userPreferences),
            },
          };
        }

        return {
          ...state,
          userOverrides: {
            ...state.userOverrides,
            [chainId]: userPreferences,
          },
        };
      });
    },

    updateCustomNetwork: createParameterizedSelector(({ userOverrides }) => {
      return (chainId: number, updates: Partial<UserPreferences>) => {
        const existing = userOverrides[chainId];
        if (!existing) return;

        const newUserPreferences = merge(existing, updates);

        set({
          userOverrides: {
            ...userOverrides,
            [chainId]: newUserPreferences,
          },
        });
      };
    }),

    removeCustomNetwork: createParameterizedSelector(({ userOverrides }) => {
      return (chainId: number) => {
        const preferences = userOverrides[chainId];
        if (preferences?.type !== 'custom') return false;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [chainId]: _, ...newUserOverrides } = userOverrides;
        set({ userOverrides: newUserOverrides });
        return true;
      };
    }),

    removeRpcFromNetwork: createParameterizedSelector(({ userOverrides }) => {
      return (chainId: number, rpcUrl: string) => {
        const preferences = userOverrides[chainId];
        if (!preferences) return { success: false, newRpcsLength: -1 };

        const isActiveRpc = preferences.activeRpcUrl === rpcUrl;
        // handle case where we're removing last RPC
        // we need to delete the network if there are no RPCs left
        if (isActiveRpc && Object.keys(preferences.rpcs).length === 1) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [chainId]: _, ...newUserOverrides } = userOverrides;
          set({ userOverrides: newUserOverrides });
          return {
            success: true,
            newRpcsLength: 0,
          };
        }

        const otherRpcUrl = Object.values(preferences.rpcs).find(
          (rpc) => rpc.rpcUrls.default.http[0] !== rpcUrl,
        );
        if (!otherRpcUrl) return { success: false, newRpcsLength: -1 };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [rpcUrl]: _, ...newRpcs } = preferences.rpcs;
        const newUserOverridesForChain: UserPreferences = {
          ...preferences,
          activeRpcUrl: otherRpcUrl.rpcUrls.default.http[0],
          rpcs: newRpcs,
        };

        set({
          userOverrides: {
            ...userOverrides,
            [chainId]: newUserOverridesForChain,
          },
        });

        return {
          success: true,
          newRpcsLength: Object.keys(newRpcs).length,
        };
      };
    }),

    // TODO: Would like to remove already added custom networks from this list
    getSupportedCustomNetworks: createSelector(({ networks }) => {
      return [
        ...networks.customNetworks.customNetworks,
        ...LOCAL_TESTING_NETWORKS,
      ].sort((a, b) => a.name.localeCompare(b.name));
    }),

    getSupportedCustomNetworksIconUrls: createSelector(({ networks }) => {
      return [
        ...networks.customNetworks.customNetworks,
        ...LOCAL_TESTING_NETWORKS,
      ].reduce(
        (acc, network) => ({
          ...acc,
          [network.id]: network.iconURL,
        }),
        {},
      );
    }),

    getSupportedCustomNetworksTestnetFaucets: createSelector(({ networks }) => {
      return [
        ...networks.customNetworks.customNetworks,
        ...LOCAL_TESTING_NETWORKS,
      ].reduce(
        (acc, network) => ({
          ...acc,
          [network.id]: network.testnet.FaucetURL,
        }),
        {},
      );
    }),

    getSupportedCustomNetworkTestnetFaucet: createParameterizedSelector(
      ({ networks }) => {
        return (chainId: ChainId) => {
          const network = [
            ...networks.customNetworks.customNetworks,
            ...LOCAL_TESTING_NETWORKS,
          ].find((network) => network.id === chainId);
          return network?.testnet.FaucetURL;
        };
      },
    ),

    getSupportedNetworks: createParameterizedSelector(({ mergedChainData }) => {
      return (includeTestnets = false) => {
        return Object.values(mergedChainData).reduce((acc, chain) => {
          if (!includeTestnets && chain.testnet) return acc;
          return {
            ...acc,
            [chain.id]: chain,
          };
        }, {});
      };
    }),

    getOrderSortedSupportedNetworks: createParameterizedSelector(
      ({ mergedChainData }) => {
        return (includeTestnets = false) => {
          return Object.values(mergedChainData)
            .filter((chain) => !includeTestnets || !chain.testnet)
            .sort((a, b) => {
              // If either order is undefined, put it at the end
              if (a.order === undefined && b.order === undefined) return 0;
              if (a.order === undefined) return 1;
              if (b.order === undefined) return -1;
              // Otherwise sort by order
              return a.order - b.order;
            });
        };
      },
    ),

    getSupportedNetwork: createParameterizedSelector(({ mergedChainData }) => {
      return (chainId) => {
        return mergedChainData[chainId];
      };
    }),

    getSupportedNetworksIds: createParameterizedSelector(
      ({ mergedChainData }) => {
        return (includeTestnets = false) => {
          return Object.values(mergedChainData).reduce<number[]>(
            (acc, chain) => {
              if (!includeTestnets && chain.testnet) return acc;
              return [...acc, chain.id];
            },
            [],
          );
        };
      },
    ),

    getSupportedNetworksBadgeUrls: createParameterizedSelector(
      ({ networks }) => {
        return (includeTestnets = false) => {
          return Object.values(networks.backendNetworks.networks).reduce(
            (acc, chain) => {
              if (!includeTestnets && chain.testnet) return acc;
              return { ...acc, [chain.id]: chain.icons.badgeURL };
            },
            {},
          );
        };
      },
    ),

    getSupportedNetworkBadgeUrl: createParameterizedSelector(({ networks }) => {
      return (chainId: number) => {
        return networks.backendNetworks.networks[chainId].icons.badgeURL;
      };
    }),

    getDefaultFavorites: createSelector(({ networks }) => {
      return networks.backendNetworks.networks.reduce((acc, network) => {
        if (network.internal && !(INTERNAL_BUILD || IS_DEV)) return acc;

        return {
          ...acc,
          [network.id]: network.favorites.map((f) => f.address as AddressOrEth),
        };
      }, {});
    }),
  }),
  {
    partialize: (state) => ({
      networks: state.networks,
      userOverrides: state.userOverrides,
    }),
    storageKey: 'networkStore',
    version: 1,
  },
);

export const syncDefaultFavoritesForNewlySupportedNetworks = (
  newNetworks: Map<string, BackendNetwork>,
) => {
  const { favorites } = favoritesStore.getState();
  const newFavorites = { ...favorites };
  for (const [key, network] of newNetworks) {
    const chainId = toChainId(key);
    const stateChainFavorites = favorites[chainId] || [];
    newFavorites[chainId] = [
      ...new Set(
        stateChainFavorites.concat(
          network.favorites.map((f) => f.address as AddressOrEth),
        ),
      ),
    ];
  }

  favoritesStore.getState().setFavorites(newFavorites);
};
