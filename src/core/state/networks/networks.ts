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
  getSupportedCustomNetworks: () => CustomNetwork[];
  getSupportedCustomNetworksIconUrl: () => Record<number, string>;
  getSupportedCustomNetworksTestnetFaucet: () => Record<number, string>;
  getSupportedCustomNetworkTestnetFaucet: (
    chainId: number,
  ) => string | undefined;

  getSupportNetworksIconUrls: () => Record<number, string>;

  getDefaultFavorites: () => Record<number, AddressOrEth[]>;
}

let lastNetworks: Networks | null = null;
let lastUserOverrides: Record<number, UserPreferences> | null = null;
let mergedChainData: Record<number, MergedChain> | null = null;

function createSelector<T>(
  selectorFn: (
    networks: Networks,
    userOverrides: Record<number, UserPreferences>,
    mergedChainData: Record<number, MergedChain>,
  ) => T,
): () => T {
  const uninitialized = Symbol();
  let cachedResult: T | typeof uninitialized = uninitialized;
  let memoizedFn:
    | ((
        networks: Networks,
        userOverrides: Record<number, UserPreferences>,
        mergedChainData: Record<number, MergedChain>,
      ) => T)
    | null = null;

  return () => {
    const { networks, userOverrides } = networkStore.getState();

    const didNetworksChange = lastNetworks !== networks;
    const didUserOverridesChange = lastUserOverrides !== userOverrides;

    if (
      cachedResult !== uninitialized &&
      !didNetworksChange &&
      !didUserOverridesChange
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

    cachedResult = memoizedFn(networks, userOverrides, mergedChainData);
    return cachedResult;
  };
}

function createParameterizedSelector<T, Args extends unknown[]>(
  selectorFn: (
    networks: Networks,
    userOverrides: Partial<Record<ChainId, UserPreferences>>,
    mergedChainData: Record<number, MergedChain>,
  ) => (...args: Args) => T,
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
      memoizedFn = selectorFn(networks, userOverrides, mergedChainData);
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

  () => ({
    ...initialState,

    getSupportedCustomNetworks: createSelector((networks) => {
      return [
        ...networks.customNetworks.customNetworks,
        ...LOCAL_TESTING_NETWORKS,
      ].sort((a, b) => a.name.localeCompare(b.name));
    }),

    getSupportedCustomNetworksIconUrl: createSelector((networks) => {
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

    getSupportedCustomNetworksTestnetFaucet: createSelector((networks) => {
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
      (networks) => {
        return (chainId: ChainId) => {
          const network = [
            ...networks.customNetworks.customNetworks,
            ...LOCAL_TESTING_NETWORKS,
          ].find((network) => network.id === chainId);
          return network?.testnet.FaucetURL;
        };
      },
    ),

    getSupportNetworksIconUrls: createSelector((networks) => {
      return networks.backendNetworks.networks.reduce((acc, network) => {
        if (network.internal && !(INTERNAL_BUILD || IS_DEV)) return acc;

        return {
          ...acc,
          [network.id]: network.icons.badgeURL,
        };
      }, {});
    }),

    getDefaultFavorites: createSelector((networks) => {
      return networks.backendNetworks.networks.reduce((acc, network) => {
        if (network.internal && !(INTERNAL_BUILD || IS_DEV)) return acc;

        return {
          ...acc,
          [network.id]: network.favorites.map((f) => f.address as AddressOrEth),
        };
      }, {});
    }),

    getSupportedChains: createSelector((_, __, mergedChainData) => {
      return Object.values(mergedChainData);
    }),

    getSupportedChainIds: createSelector((_, __, mergedChainData) => {
      return Object.keys(mergedChainData).map(toChainId);
    }),

    getSupportedMainnetChains: createSelector((_, __, mergedChainData) => {
      return Object.values(mergedChainData).filter((chain) => !chain.testnet);
    }),

    getSupportedMainnetChainIds: createSelector((_, __, mergedChainData) => {
      return Object.values(mergedChainData)
        .filter((chain) => !chain.testnet)
        .map(({ id }) => id);
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
