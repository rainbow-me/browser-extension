import buildTimeNetworks from 'static/data/networks.json';
import { fetchNetworks } from '~/core/resources/networks/networks';
import { createQueryStore } from '~/core/state/internal/createQueryStore';
import {
  ChainId,
  CustomNetwork,
  Networks,
  UserPreferences,
} from '~/core/types/chains';

import {
  LOCAL_NETWORKS,
  buildInitialUserPreferences,
  differenceOrUnionOf,
  modifyUserPreferencesForNewlySupportedNetworks,
  syncDefaultFavoritesForNewlySupportedNetworks,
  toChainId,
} from './utils';

const IS_DEV = process.env.IS_DEV === 'true';
const INTERNAL_BUILD = process.env.INTERNAL_BUILD === 'true';
const IS_TESTING = process.env.IS_TESTING === 'true';

const LOCAL_TESTING_NETWORKS = IS_TESTING ? LOCAL_NETWORKS : [];

export interface NetworkState {
  // NOTE: Now backend-driven networks and backend-driven custom networks are stored in the same networks object
  networks: Networks;
  userOverrides: Record<number, UserPreferences>;
}

interface NetworkActions {
  getSupportedCustomNetworks: () => CustomNetwork[];
  getSupportedCustomNetworksIconUrl: () => Record<number, string>;
  getSupportedCustomNetworksTestnetFaucet: () => Record<number, string>;
  getSupportedCustomNetworkTestnetFaucet: (
    chainId: number,
  ) => string | undefined;

  getSupportNetworksIconUrls: () => Record<number, string>;
}

let lastNetworks: Networks | null = null;

function createSelector<T>(
  selectorFn: (
    networks: Networks,
    userOverrides: Record<number, UserPreferences>,
  ) => T,
): () => T {
  const uninitialized = Symbol();
  let cachedResult: T | typeof uninitialized = uninitialized;
  let memoizedFn:
    | ((
        networks: Networks,
        userOverrides: Record<number, UserPreferences>,
      ) => T)
    | null = null;

  return () => {
    const { networks, userOverrides } = networkStore.getState();

    if (cachedResult !== uninitialized && lastNetworks === networks) {
      return cachedResult;
    }

    if (lastNetworks !== networks) lastNetworks = networks;
    if (!memoizedFn) memoizedFn = selectorFn;

    cachedResult = memoizedFn(networks, userOverrides);
    return cachedResult;
  };
}

function createParameterizedSelector<T, Args extends unknown[]>(
  selectorFn: (
    networks: Networks,
    userOverrides: Partial<Record<ChainId, UserPreferences>>,
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

    if (
      cachedResult !== uninitialized &&
      lastNetworks === networks &&
      !argsChanged
    ) {
      return cachedResult;
    }

    if (!memoizedFn || lastNetworks !== networks) {
      lastNetworks = networks;
      memoizedFn = selectorFn(networks, userOverrides);
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

        void syncDefaultFavoritesForNewlySupportedNetworks(
          Array.from(newNetworks.keys()).map(toChainId),
        );

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

    // getSupportedChains: createSelector((networks, userOverrides) => {
    //   const supported = networks.backendNetworks.networks.filter((network) => {
    //     return !network.internal || INTERNAL_BUILD || IS_DEV;
    //   });

    //   for (const [chainId, override] of Object.entries(userOverrides)) {
    //     const index = supported.findIndex((network) => network.id === chainId);
    //     if (index === -1 && override.type === 'custom') {
    //       supported.push(override);
    //     } else if (override.type === 'supported') {
    //       supported[index] = {
    //         ...supported[index],
    //         ...override,
    //       }
    //     }
    //   }

    //   return supported;
    // }),

    // getSupportedChainIds: createSelector((networks, userOverrides) => {
    //   const supported = networks.backendNetworks.networks.filter((network) => {
    //     return !network.internal || INTERNAL_BUILD || IS_DEV;
    //   })

    //   const supportedChainIds = new Set<number>();

    //   for (const [chainId, override] of Object.entries(userOverrides)) {
    //     const index = supported.findIndex((network) => network.id === chainId);
    //     if (index === -1 && override.type === 'custom') {
    //       supportedChainIds.add(+override.id);
    //     } else {
    //       supportedChainIds.add(+chainId);
    //     }
    //   }

    //   return supported;
    // }),
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
