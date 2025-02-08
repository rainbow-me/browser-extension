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
  BackendNetworkWithPrivateMempoolTimeout,
  ChainId,
  ChainPreferences,
  CustomNetwork,
  Networks,
  TransformedChain,
} from '~/core/types/chains';

const IS_DEV = process.env.IS_DEV === 'true';
const INTERNAL_BUILD = process.env.INTERNAL_BUILD === 'true';
const IS_TESTING = process.env.IS_TESTING === 'true';

const DEFAULT_PRIVATE_MEMPOOL_TIMEOUT = 2 * 60 * 1_000; // 2 minutes
const LOCAL_TESTING_NETWORKS = IS_TESTING ? LOCAL_NETWORKS : [];

export interface NetworkState {
  networks: Networks; // contains backend-driven networks and backend-driven custom networks
  userPreferences: Record<number, ChainPreferences>; // contains user-driven overrides for backend-driven networks AND user added custom networks

  chainOrder: Array<number>;
  enabledChainIds: Set<number>;
}

interface NetworkActions {
  // user-added custom networks store methods
  getActiveRpcForChain: (chainId: number) => Chain | null;
  addCustomChain: (chainId: number, userPreferences: ChainPreferences) => void;
  updateCustomChain: (
    chainId: number,
    userPreferences: Partial<ChainPreferences>,
  ) => void;
  removeCustomChain: (chainId: number) => boolean;
  removeRpcFromChain: (
    chainId: number,
    rpcUrl: string,
  ) => {
    success: boolean;
    newRpcsLength: number;
  };
  getUserAddedChains: (
    includeTestnets?: boolean,
  ) => Record<number, TransformedChain>;
  getUserAddedChainIds: (includeTestnets?: boolean) => number[];

  // custom backend driven networks store methods
  getSupportedCustomNetworks: () => CustomNetwork[];
  getSupportedCustomNetworksIconUrls: () => Record<number, string>;
  getSupportedCustomNetworksTestnetFaucets: () => Record<number, string>;
  getSupportedCustomNetworkTestnetFaucet: (
    chainId: number,
  ) => string | undefined;

  // supported backend driven networks store methods
  getBackendSupportedChains: (
    includeTestnets?: boolean,
  ) => Record<number, TransformedChain>;
  getBackendSupportedChainIds: (includeTestnets?: boolean) => number[];
  getBackendSupportedChain: (chainId: number) => TransformedChain | undefined;
  getNeedsL1SecurityFeeChainIds: () => number[];
  getChainsNativeAsset: () => Record<number, BackendNetwork['nativeAsset']>;
  getChainsLabel: () => Record<number, string>;
  getChainsPrivateMempoolTimeout: () => Record<number, number>;
  getChainsName: () => Record<number, string>;
  filterChainIdsByService: (
    servicePath: (services: BackendNetwork['enabledServices']) => boolean,
  ) => number[];
  getMeteorologySupportedChainIds: () => number[];
  getSupportedSwapChainIds: () => number[];
  getSupportedApprovalsChainIds: () => number[];
  getSupportedTransactionsChainIds: () => number[];
  getSupportedAssetsChainIds: () => number[];
  getSupportedPositionsChainIds: () => number[];
  getSupportedTokenSearchChainIds: () => number[];
  getSupportedNftChainIds: () => number[];
  getChainGasUnits: (chainId?: number) => BackendNetwork['gasUnits'];
  getChainsBadgeUrls: () => Record<number, string>;
  getChainBadgeUrl: (chainId: number) => string | undefined;
  getDefaultFavorites: () => Record<number, AddressOrEth[]>;
  getAllChains: (includeTestnets?: boolean) => Record<number, TransformedChain>;
  getAllChainsSortedByOrder: (includeTestnets?: boolean) => TransformedChain[];
}

let lastNetworks: Networks | null = null;
let lastUserOverrides: Record<number, ChainPreferences> | null = null;
let mergedChainData: Record<number, TransformedChain> | null = null;
let lastChainOrder: Array<number> | null = null;
let lastEnabledChainIds: Set<number> | null = null;

function createSelector<T>(
  selectorFn: ({
    networks,
    userPreferences,
    mergedChainData,
  }: {
    networks: Networks;
    userPreferences: Record<number, ChainPreferences>;
    chainOrder: Array<number>;
    enabledChainIds: Set<number>;
    mergedChainData: Record<number, TransformedChain>;
  }) => T,
): () => T {
  const uninitialized = Symbol();
  let cachedResult: T | typeof uninitialized = uninitialized;
  let memoizedFn:
    | ((params: {
        networks: Networks;
        userPreferences: Record<number, ChainPreferences>;
        chainOrder: Array<number>;
        enabledChainIds: Set<number>;
        mergedChainData: Record<number, TransformedChain>;
      }) => T)
    | null = null;

  return () => {
    const { networks, userPreferences, chainOrder, enabledChainIds } =
      networkStore.getState();

    const didNetworksChange = lastNetworks !== networks;
    const didUserOverridesChange = lastUserOverrides !== userPreferences;
    const didChainOrderChange = lastChainOrder !== chainOrder;
    const didEnabledChainIdsChange = lastEnabledChainIds !== enabledChainIds;

    if (
      cachedResult !== uninitialized &&
      !didNetworksChange &&
      !didUserOverridesChange &&
      !didChainOrderChange &&
      !didEnabledChainIdsChange &&
      mergedChainData !== null
    ) {
      return cachedResult;
    }

    if (
      didNetworksChange ||
      didUserOverridesChange ||
      didChainOrderChange ||
      didEnabledChainIdsChange ||
      mergedChainData === null
    ) {
      if (didNetworksChange) lastNetworks = networks;
      if (didUserOverridesChange) lastUserOverrides = userPreferences;
      if (didChainOrderChange) lastChainOrder = chainOrder;
      if (didEnabledChainIdsChange) lastEnabledChainIds = enabledChainIds;

      mergedChainData = mergeChainData(
        networks,
        userPreferences,
        chainOrder,
        enabledChainIds,
      );
    }

    if (!memoizedFn) memoizedFn = selectorFn;

    cachedResult = memoizedFn({
      networks,
      userPreferences,
      mergedChainData,
      chainOrder,
      enabledChainIds,
    });
    return cachedResult;
  };
}

function createParameterizedSelector<T, Args extends unknown[]>(
  selectorFn: (params: {
    networks: Networks;
    userPreferences: Record<ChainId, ChainPreferences>;
    chainOrder: Array<number>;
    enabledChainIds: Set<number>;
    mergedChainData: Record<number, TransformedChain>;
  }) => (...args: Args) => T,
): (...args: Args) => T {
  const uninitialized = Symbol();
  let cachedResult: T | typeof uninitialized = uninitialized;
  let lastArgs: Args | null = null;
  let memoizedFn: ((...args: Args) => T) | null = null;

  return (...args: Args) => {
    const { networks, userPreferences, chainOrder, enabledChainIds } =
      networkStore.getState();
    const argsChanged =
      !lastArgs ||
      args.length !== lastArgs.length ||
      args.some((arg, i) => arg !== lastArgs?.[i]);

    const didNetworksChange = lastNetworks !== networks;
    const didUserOverridesChange = lastUserOverrides !== userPreferences;
    const didChainOrderChange = lastChainOrder !== chainOrder;
    const didEnabledChainIdsChange = lastEnabledChainIds !== enabledChainIds;

    if (
      cachedResult !== uninitialized &&
      !didNetworksChange &&
      !didUserOverridesChange &&
      !didChainOrderChange &&
      !didEnabledChainIdsChange &&
      !argsChanged
    ) {
      return cachedResult;
    }

    if (
      !memoizedFn ||
      didNetworksChange ||
      didUserOverridesChange ||
      didChainOrderChange ||
      didEnabledChainIdsChange ||
      mergedChainData === null
    ) {
      if (didNetworksChange) lastNetworks = networks;
      if (didUserOverridesChange) lastUserOverrides = userPreferences;
      if (didChainOrderChange) lastChainOrder = chainOrder;
      if (didEnabledChainIdsChange) lastEnabledChainIds = enabledChainIds;

      mergedChainData = mergeChainData(
        networks,
        userPreferences,
        chainOrder,
        enabledChainIds,
      );
      memoizedFn = selectorFn({
        networks,
        userPreferences,
        mergedChainData,
        chainOrder,
        enabledChainIds,
      });
    }

    lastArgs = args;
    cachedResult = memoizedFn(...args);
    return cachedResult;
  };
}

const initialState: NetworkState = {
  networks: buildTimeNetworks,
  ...buildInitialUserPreferences(),
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
          ...modifyUserPreferencesForNewlySupportedNetworks(state, newNetworks),
        };
      });
    },
    staleTime: 10 * 60 * 1000,
  },

  (set, get) => ({
    ...initialState,

    getActiveRpcForChain: createParameterizedSelector(({ mergedChainData }) => {
      return (chainId: number) => {
        const chain = mergedChainData[chainId];
        if (!chain) return null;
        return chain.rpcs[chain.activeRpcUrl];
      };
    }),

    addCustomChain: (chainId, userPreferences) => {
      set((state) => {
        const existing = state.userPreferences[chainId];
        if (existing) {
          return {
            ...state,
            userPreferences: {
              ...state.userPreferences,
              [chainId]: merge(existing, userPreferences),
            },
          };
        }

        return {
          ...state,
          userPreferences: {
            ...state.userPreferences,
            [chainId]: userPreferences,
          },
        };
      });
    },

    updateCustomChain: createParameterizedSelector(({ userPreferences }) => {
      return (chainId: number, updates: Partial<ChainPreferences>) => {
        const existing = userPreferences[chainId];
        if (!existing) return;

        const newUserPreferences = merge(existing, updates);

        set({
          userPreferences: {
            ...userPreferences,
            [chainId]: newUserPreferences,
          },
        });
      };
    }),

    removeCustomChain: createParameterizedSelector(({ userPreferences }) => {
      return (chainId: number) => {
        const preferences = userPreferences[chainId];
        if (preferences?.type !== 'custom') return false;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [chainId]: _, ...newUserOverrides } = userPreferences;
        set({ userPreferences: newUserOverrides });
        return true;
      };
    }),

    removeRpcFromChain: createParameterizedSelector(({ userPreferences }) => {
      return (chainId: number, rpcUrl: string) => {
        const preferences = userPreferences[chainId];
        if (!preferences) return { success: false, newRpcsLength: -1 };

        const isActiveRpc = preferences.activeRpcUrl === rpcUrl;
        // handle case where we're removing last RPC
        // we need to delete the network if there are no RPCs left
        if (isActiveRpc && Object.keys(preferences.rpcs).length === 1) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [chainId]: _, ...newUserOverrides } = userPreferences;
          set({ userPreferences: newUserOverrides });
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
        const newUserOverridesForChain: ChainPreferences = {
          ...preferences,
          activeRpcUrl: otherRpcUrl.rpcUrls.default.http[0],
          rpcs: newRpcs,
        };

        set({
          userPreferences: {
            ...userPreferences,
            [chainId]: newUserOverridesForChain,
          },
        });

        return {
          success: true,
          newRpcsLength: Object.keys(newRpcs).length,
        };
      };
    }),

    getUserAddedChains: createParameterizedSelector(
      ({ networks, mergedChainData }) => {
        return (includeTestnets = false) => {
          return Object.values(mergedChainData).reduce<
            Record<number, TransformedChain>
          >((acc, chain) => {
            if (
              chain.type === 'custom' &&
              !networks.backendNetworks.networks.find(
                (c) => +c.id === chain.id,
              ) &&
              chain.testnet &&
              includeTestnets
            ) {
              acc[chain.id] = chain;
            }
            return acc;
          }, {});
        };
      },
    ),

    getUserAddedChainIds: createParameterizedSelector(
      ({ networks, mergedChainData }) => {
        return (includeTestnets = false) => {
          return Object.values(mergedChainData).reduce<number[]>(
            (acc, chain) => {
              if (
                chain.type === 'custom' &&
                chain.testnet &&
                includeTestnets &&
                !networks.backendNetworks.networks.find(
                  (c) => +c.id === chain.id,
                )
              ) {
                acc.push(chain.id);
              }
              return acc;
            },
            [],
          );
        };
      },
    ),

    // TODO: remove already added custom networks from this list
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

    getBackendSupportedChains: createParameterizedSelector(
      ({ mergedChainData }) => {
        return (includeTestnets = false) => {
          return Object.values(mergedChainData).reduce((acc, chain) => {
            if (
              (!includeTestnets && chain.testnet) ||
              chain.type !== 'supported'
            )
              return acc;
            return {
              ...acc,
              [chain.id]: chain,
            };
          }, {});
        };
      },
    ),

    getBackendSupportedChainIds: createParameterizedSelector(
      ({ mergedChainData }) => {
        return (includeTestnets = false) => {
          return Object.values(mergedChainData).reduce<number[]>(
            (acc, chain) => {
              if (
                (!includeTestnets && chain.testnet) ||
                chain.type !== 'supported'
              )
                return acc;
              return [...acc, chain.id];
            },
            [],
          );
        };
      },
    ),

    getBackendSupportedChain: createParameterizedSelector(
      ({ mergedChainData }) => {
        return (chainId) => {
          const chain = mergedChainData[chainId];
          if (chain.type !== 'supported') return undefined;
          return chain;
        };
      },
    ),

    getNeedsL1SecurityFeeChainIds: createSelector(({ networks }) => {
      return networks.backendNetworks.networks
        .filter((chain) => chain.opStack)
        .map((chain) => toChainId(chain.id));
    }),

    getChainsNativeAsset: createSelector(({ networks }) => {
      return networks.backendNetworks.networks.reduce((acc, chain) => {
        return {
          ...acc,
          [chain.id]: chain.nativeAsset,
        };
      }, {});
    }),

    getChainsLabel: createSelector(({ networks }) => {
      return networks.backendNetworks.networks.reduce(
        (acc, chain) => {
          return {
            ...acc,
            [chain.id]: chain.label,
          };
        },
        {
          [ChainId.avalancheFuji]: 'Avalanche Fuji',
          [ChainId.apechainCurtis]: 'Apechain Curtis',
          [ChainId.inkSepolia]: 'Ink Sepolia',
          [ChainId.sankoTestnet]: 'Sanko Testnet',
          [ChainId.gravitySepolia]: 'Gravity Sepolia',
        },
      );
    }),

    getChainsPrivateMempoolTimeout: createSelector(({ networks }) => {
      return networks.backendNetworks.networks.reduce((acc, chain) => {
        return {
          ...acc,
          [chain.id]:
            (chain as BackendNetworkWithPrivateMempoolTimeout)
              .privateMempoolTimeout || DEFAULT_PRIVATE_MEMPOOL_TIMEOUT,
        };
      }, {});
    }),

    getChainsName: createSelector(({ networks }) => {
      return networks.backendNetworks.networks.reduce(
        (acc, chain) => {
          return { ...acc, [chain.id]: chain.name };
        },
        {
          [ChainId.avalancheFuji]: 'avalanche-fuji',
          [ChainId.apechainCurtis]: 'apechain-curtis',
          [ChainId.inkSepolia]: 'ink-sepolia',
          [ChainId.sankoTestnet]: 'sanko-testnet',
          [ChainId.gravitySepolia]: 'gravity-sepolia',
        },
      );
    }),

    filterChainIdsByService: createParameterizedSelector(({ networks }) => {
      return (
        servicePath: (services: BackendNetwork['enabledServices']) => boolean,
      ) => {
        return networks.backendNetworks.networks
          .filter((chain) => servicePath(chain.enabledServices))
          .map((chain) => toChainId(chain.id));
      };
    }),

    getMeteorologySupportedChainIds: createSelector(() => {
      return get().filterChainIdsByService(
        (services) => services.meteorology.enabled,
      );
    }),

    getSupportedSwapChainIds: createSelector(() => {
      return get().filterChainIdsByService((services) => services.swap.enabled);
    }),

    getSupportedApprovalsChainIds: createSelector(() => {
      return get().filterChainIdsByService(
        (services) => services.addys.approvals,
      );
    }),

    getSupportedTransactionsChainIds: createSelector(() => {
      return get().filterChainIdsByService(
        (services) => services.addys.transactions,
      );
    }),

    getSupportedAssetsChainIds: createSelector(() => {
      return get().filterChainIdsByService((services) => services.addys.assets);
    }),

    getSupportedPositionsChainIds: createSelector(() => {
      return get().filterChainIdsByService(
        (services) => services.addys.positions,
      );
    }),

    getSupportedTokenSearchChainIds: createSelector(() => {
      return get().filterChainIdsByService(
        (services) => services.tokenSearch.enabled,
      );
    }),

    getSupportedNftChainIds: createSelector(() => {
      return get().filterChainIdsByService(
        (services) => services.nftProxy.enabled,
      );
    }),

    getChainGasUnits: createParameterizedSelector(
      ({ networks }) =>
        (chainId?: number) => {
          const chainsGasUnits = networks.backendNetworks.networks.reduce(
            (acc, backendNetwork) => {
              acc[toChainId(backendNetwork.id)] = backendNetwork.gasUnits;
              return acc;
            },
            {} as Record<number, BackendNetwork['gasUnits']>,
          );

          return (
            (chainId ? chainsGasUnits[chainId] : undefined) ||
            chainsGasUnits[ChainId.mainnet]
          );
        },
    ),

    getChainsBadgeUrls: createSelector(({ networks }) => {
      return Object.values(networks.backendNetworks.networks).reduce(
        (acc, chain) => {
          return { ...acc, [chain.id]: chain.icons.badgeURL };
        },
        {},
      );
    }),

    getChainBadgeUrl: createParameterizedSelector(({ networks }) => {
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

    getAllChains: createParameterizedSelector(({ mergedChainData }) => {
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

    getAllChainsSortedByOrder: createParameterizedSelector(
      ({ mergedChainData }) => {
        return (includeTestnets = false) => {
          return Object.values(mergedChainData)
            .filter((chain) => includeTestnets || !chain.testnet)
            .sort((a, b) => {
              if (a.order === undefined && b.order === undefined) return 0;
              if (a.order === undefined) return 1;
              if (b.order === undefined) return -1;
              return a.order - b.order;
            });
        };
      },
    ),
  }),
  {
    partialize: (state) => ({
      networks: state.networks,
      userPreferences: state.userPreferences,
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
