import { Chain } from 'viem';

import buildTimeNetworks from 'static/data/networks.json';
import { fetchNetworks } from '~/core/resources/networks/networks';
import { favoritesStore } from '~/core/state/favorites';
import { createQueryStore } from '~/core/state/internal/createQueryStore';
import {
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

const DEFAULT_PRIVATE_MEMPOOL_TIMEOUT = 2 * 60 * 1_000; // 2 minutes

export interface NetworkState {
  networks: Networks; // contains backend-driven networks and backend-driven custom networks
  userPreferences: Record<number, ChainPreferences>; // contains user-driven overrides for backend-driven networks AND user added custom networks

  chainOrder: Array<number>;
  enabledChainIds: Set<number>;
}

interface NetworkActions {
  // user-added custom networks store methods
  getActiveRpcForChain: (chainId: number) => Chain | null;
  addCustomChain: (
    chainId: number,
    chain: Chain,
    rpcUrl: string,
    active: boolean,
  ) => void;
  removeCustomChain: (chainId: number) => boolean;
  selectRpcForChain: (chainId: number, rpcUrl: string) => void;
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
  updateChainOrder: (chainId: number, destinationIdx: number) => void;
  updateEnabledChains: (chainIds: number[], enabled: boolean) => void;

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
  getChainsBadgeUrls: () => Record<
    number,
    BackendNetwork['icons']['uncropped']
  >;
  getBackendChainsByMainnetId: () => Record<number, BackendNetwork[]>;
  getBackendChainIdsByMainnetId: () => Record<number, number[]>;
  getDefaultFavorites: () => Record<number, AddressOrEth[]>;
  getChain: (chainId: number) => TransformedChain | undefined;
  getAllChains: (includeTestnets?: boolean) => Record<number, TransformedChain>;
  getAllActiveRpcChains: (includeTestnets?: boolean) => Chain[];
  getAllChainsSortedByOrder: (includeTestnets?: boolean) => TransformedChain[];
}

let lastNetworks: Networks | null = null;
let lastUserPreferences: Record<number, ChainPreferences> | null = null;
let lastChainOrder: number[] | null = null;
let lastEnabledChainIds: Set<number> | null = null;
let mergedChainData: Record<number, TransformedChain> | null = null;

/**
 * Returns the shared mergedChainData.
 * Only recomputes if one of the input references has changed.
 */
function getMergedChainData(
  networks: Networks,
  userPreferences: Record<number, ChainPreferences>,
  chainOrder: number[],
  enabledChainIds: Set<number>,
): Record<number, TransformedChain> {
  if (
    mergedChainData &&
    lastNetworks === networks &&
    lastUserPreferences === userPreferences &&
    lastChainOrder === chainOrder &&
    lastEnabledChainIds === enabledChainIds
  ) {
    return mergedChainData;
  }
  // Update all global references
  lastNetworks = networks;
  lastUserPreferences = userPreferences;
  lastChainOrder = chainOrder;
  lastEnabledChainIds = enabledChainIds;
  mergedChainData = mergeChainData(
    networks,
    userPreferences,
    chainOrder,
    enabledChainIds,
  );
  return mergedChainData;
}

function createSelector<T>(
  selectorFn: (params: {
    networks: Networks;
    userPreferences: Record<number, ChainPreferences>;
    chainOrder: number[];
    enabledChainIds: Set<number>;
    mergedChainData: Record<number, TransformedChain>;
  }) => T,
): () => T {
  const uninitialized = Symbol();
  let cachedResult: T | typeof uninitialized = uninitialized;
  let lastInputs: {
    networks: Networks;
    userPreferences: Record<number, ChainPreferences>;
    chainOrder: number[];
    enabledChainIds: Set<number>;
  } | null = null;

  return () => {
    const { networks, userPreferences, chainOrder, enabledChainIds } =
      networkStore.getState();

    // If the inputs haven't changed (by reference), return the cached result
    if (
      lastInputs &&
      lastInputs.networks === networks &&
      lastInputs.userPreferences === userPreferences &&
      lastInputs.chainOrder === chainOrder &&
      lastInputs.enabledChainIds === enabledChainIds &&
      cachedResult !== uninitialized
    ) {
      return cachedResult;
    }

    // Save the new inputs
    lastInputs = { networks, userPreferences, chainOrder, enabledChainIds };

    // Retrieve (or compute) the shared merged data
    const sharedMergedChainData = getMergedChainData(
      networks,
      userPreferences,
      chainOrder,
      enabledChainIds,
    );

    // Compute and cache the result for this selector
    cachedResult = selectorFn({
      networks,
      userPreferences,
      chainOrder,
      enabledChainIds,
      mergedChainData: sharedMergedChainData,
    });
    return cachedResult;
  };
}

function createParameterizedSelector<T, Args extends unknown[]>(
  selectorFn: (params: {
    networks: Networks;
    userPreferences: Record<number, ChainPreferences>;
    chainOrder: number[];
    enabledChainIds: Set<number>;
    mergedChainData: Record<number, TransformedChain>;
  }) => (...args: Args) => T,
): (...args: Args) => T {
  const uninitialized = Symbol();
  let cachedResult: T | typeof uninitialized = uninitialized;
  let lastArgs: Args | null = null;
  let lastInputs: {
    networks: Networks;
    userPreferences: Record<number, ChainPreferences>;
    chainOrder: number[];
    enabledChainIds: Set<number>;
  } | null = null;
  let memoizedFn: ((...args: Args) => T) | null = null;

  return (...args: Args) => {
    const { networks, userPreferences, chainOrder, enabledChainIds } =
      networkStore.getState();

    // Determine if the additional arguments have changed
    const argsChanged =
      !lastArgs ||
      args.length !== lastArgs.length ||
      args.some((arg, i) => arg !== lastArgs![i]);

    // Check if the state inputs have changed
    const inputsUnchanged =
      lastInputs &&
      lastInputs.networks === networks &&
      lastInputs.userPreferences === userPreferences &&
      lastInputs.chainOrder === chainOrder &&
      lastInputs.enabledChainIds === enabledChainIds;

    // If inputs and args are unchanged, return the cached result
    if (cachedResult !== uninitialized && inputsUnchanged && !argsChanged) {
      return cachedResult;
    }

    // Update state inputs and args
    lastInputs = { networks, userPreferences, chainOrder, enabledChainIds };
    lastArgs = args;

    // Get the shared merged data
    const sharedMergedChainData = getMergedChainData(
      networks,
      userPreferences,
      chainOrder,
      enabledChainIds,
    );

    // Recompute the memoized function if needed
    memoizedFn = selectorFn({
      networks,
      userPreferences,
      chainOrder,
      enabledChainIds,
      mergedChainData: sharedMergedChainData,
    });
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

    addCustomChain: (chainId, chain, rpcUrl, active) => {
      const { chainOrder, userPreferences } = get();

      const order = [...chainOrder].indexOf(chainId);
      const existing = userPreferences[chainId];

      const enabledChainIds = new Set([...chainOrder, chainId]);

      // add the rpc url to the chain if it exists
      if (existing) {
        const newUserPrferences = {
          ...userPreferences,
          [chainId]: {
            ...existing,
            activeRpcUrl: active ? rpcUrl : existing.activeRpcUrl,
            rpcs: {
              ...existing.rpcs,
              [rpcUrl]: chain,
            },
          },
        };

        set({
          chainOrder: order === -1 ? [...chainOrder, chainId] : chainOrder,
          enabledChainIds,
          userPreferences: newUserPrferences,
        });
      } else {
        set({
          chainOrder: order === -1 ? [...chainOrder, chainId] : chainOrder,
          enabledChainIds,
          userPreferences: {
            ...userPreferences,
            [chainId]: {
              ...chain,
              type: 'custom',
              activeRpcUrl: rpcUrl,
              rpcs: {
                [rpcUrl]: chain,
              },
            },
          },
        });
      }
    },

    removeCustomChain: (chainId: number) => {
      const { userPreferences, chainOrder, enabledChainIds } = get();
      const preferences = userPreferences[chainId];
      if (preferences?.type !== 'custom') return false;

      // Remove from userPreferences
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [chainId]: _, ...newUserOverrides } = userPreferences;

      // Remove from chainOrder
      const newChainOrder = chainOrder.filter((id) => id !== chainId);

      // Remove from enabledChainIds
      const newEnabledChainIds = new Set(enabledChainIds);
      newEnabledChainIds.delete(chainId);

      set({
        userPreferences: newUserOverrides,
        chainOrder: newChainOrder,
        enabledChainIds: newEnabledChainIds,
      });

      return true;
    },

    selectRpcForChain: (chainId: number, rpcUrl: string) => {
      set((state) => {
        const preferences = state.userPreferences[chainId];
        if (!preferences) return state;

        const newUserPreferences = {
          ...state.userPreferences,
          [chainId]: {
            ...state.userPreferences[chainId],
            activeRpcUrl: rpcUrl,
          },
        };

        return { ...state, userPreferences: newUserPreferences };
      });
    },

    removeRpcFromChain: (chainId: number, rpcUrl: string) => {
      const { userPreferences, removeCustomChain } = get();
      const preferences = userPreferences[chainId];
      if (!preferences) return { success: false, newRpcsLength: -1 };

      // we need to delete the custom chain if there are no RPCs left
      if (
        Object.keys(preferences.rpcs).length === 1 &&
        preferences.type === 'custom'
      ) {
        const success = removeCustomChain(chainId);
        return {
          success,
          newRpcsLength: success ? 0 : -1,
        };
      }

      const newUserOverridesForChain: ChainPreferences = {
        ...preferences,
      };

      const isActiveRpc = preferences.activeRpcUrl === rpcUrl;

      // if the active RPC is being removed, we need to set the active RPC to a different one
      if (isActiveRpc) {
        const otherRpcUrl = Object.values(preferences.rpcs).find(
          (rpc) => rpc.rpcUrls.default.http[0] !== rpcUrl,
        );
        if (!otherRpcUrl) return { success: false, newRpcsLength: -1 };
        newUserOverridesForChain.activeRpcUrl =
          otherRpcUrl.rpcUrls.default.http[0];
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [rpcUrl]: _, ...newRpcs } = preferences.rpcs;
      newUserOverridesForChain.rpcs = newRpcs;

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
    },

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

    updateChainOrder: (chainId: number, destinationIdx: number) => {
      const { chainOrder } = get();
      const index = chainOrder.indexOf(chainId);
      if (index === -1) {
        // perform insertion at that index and shift everything else down
        const currentOrder = [...chainOrder];
        currentOrder.splice(destinationIdx + 1, 0, chainId);
        const newOrder = Array.from(new Set(currentOrder));
        set({ chainOrder: newOrder });
      } else {
        const currentOrder = [...chainOrder];
        const [removed] = currentOrder.splice(index, 1);
        currentOrder.splice(destinationIdx, 0, removed);
        const newOrder = Array.from(new Set(currentOrder));
        set({ chainOrder: newOrder });
      }
    },

    updateEnabledChains: (chainIds: number[], enabled: boolean) => {
      const { enabledChainIds } = get();
      const newEnabledChainIds = new Set(enabledChainIds);
      chainIds.forEach((chainId) => {
        if (enabled) {
          newEnabledChainIds.add(chainId);
        } else {
          newEnabledChainIds.delete(chainId);
        }
      });
      set({ enabledChainIds: newEnabledChainIds });
    },

    getSupportedCustomNetworks: createSelector(
      ({ networks, mergedChainData }) => {
        const existingNetworks = Object.keys(mergedChainData).map(Number);
        return networks.customNetworks.customNetworks
          .filter((network) => !existingNetworks.includes(network.id))
          .sort((a, b) => a.name.localeCompare(b.name));
      },
    ),

    getSupportedCustomNetworksIconUrls: createSelector(({ networks }) => {
      return networks.customNetworks.customNetworks.reduce(
        (acc, network) => ({
          ...acc,
          [network.id]: network.iconURL,
        }),
        {},
      );
    }),

    getSupportedCustomNetworksTestnetFaucets: createSelector(({ networks }) => {
      return networks.customNetworks.customNetworks.reduce(
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
          const network = networks.customNetworks.customNetworks.find(
            (network) => network.id === chainId,
          );
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
          return { ...acc, [chain.id]: chain.icons.uncropped };
        },
        {},
      );
    }),

    getBackendChainIdsByMainnetId: createSelector(({ networks }) => {
      return networks.backendNetworks.networks.reduce(
        (acc, curr) => {
          const mainnetId = +curr.mainnetId;
          if (!acc[mainnetId]) {
            acc[mainnetId] = [];
          }
          if (+curr.id === mainnetId) return acc;
          acc[mainnetId].push(+curr.id);
          return acc;
        },
        {} as Record<number, number[]>,
      );
    }),

    getBackendChainsByMainnetId: createSelector(({ networks }) => {
      return networks.backendNetworks.networks.reduce(
        (acc, curr) => {
          const mainnetId = +curr.mainnetId;
          if (!acc[mainnetId]) {
            acc[mainnetId] = [];
          }
          if (+curr.id === mainnetId) return acc;
          acc[mainnetId].push(curr);
          return acc;
        },
        {} as Record<number, BackendNetwork[]>,
      );
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

    getChain: createParameterizedSelector(({ mergedChainData }) => {
      return (chainId) => {
        return mergedChainData[chainId];
      };
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

    getAllActiveRpcChains: createSelector(({ mergedChainData }) => {
      return Object.values(mergedChainData).map((chain) => {
        return chain.rpcs[chain.activeRpcUrl];
      });
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
      chainOrder: state.chainOrder,
      enabledChainIds: state.enabledChainIds,
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
