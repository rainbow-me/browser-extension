import { create } from 'zustand';
import { Chain } from 'viem';
import buildTimeNetworks from 'static/data/networks.json';

import { fetchNetworks } from '~/core/resources/networks/networks';
import { createQueryStore } from '~/core/state/internal/createQueryStore';
import { ChainId, CustomRPC, ExtendedChain, Networks } from '~/core/types/chains';  
import { differenceOrUnionOf, mergeArrays, mergePrimitive, transformBackendNetworkToExtendedChain, transformCustomNetworkToExtendedChain, transformNetworksToExtendedChains } from './utils';
import { GasSpeed } from '~/core/types/gas';
import { logger } from '~/logger';
import { useFavoritesStore } from '~/core/state/favorites';
import { RainbowChain, useRainbowChainsStore } from '~/core/state/rainbowChains';
import { RainbowChainAsset, useRainbowChainAssetsStore } from '~/core/state/rainbowChainAssets';
import { useUserChainsStore } from '~/core/state/userChains';
import { AddressOrEth } from '~/core/types/assets';
import { DEFAULT_PRIVATE_MEMPOOL_TIMEOUT } from './utils';

interface NetworkState {
	// encapsulates backend networks and custom networks (just backend driven custom networks)
  networks: Networks;
  // backend driven, custom networks, and user-added networks
  chains: ExtendedChain[];
}

interface NetworkActions {
  getEnabledChains: () => ExtendedChain[];
  getEnabledChainIds: () => ExtendedChain['id'][];
  getBackendDrivenChains: () => ExtendedChain[];
  getBackendDrivenChainIds: () => ExtendedChain['id'][];
  getCustomChains: () => ExtendedChain[];
  getCustomChainIds: () => ExtendedChain['id'][];
  getMainnetChains: () => ExtendedChain[];
  getMainnetChainIds: () => ExtendedChain['id'][];

  getChainById: (chainId: ExtendedChain['id']) => ExtendedChain | undefined;

  getNeedsL1SecurityFeeChains: () => ExtendedChain['id'][];
  getChainsNativeAsset: () => Record<ExtendedChain['id'], ExtendedChain['metadata']['nativeAsset']>;
  getChainsLabel: () => Record<ExtendedChain['id'], string>;
  getChainsName: () => Record<ExtendedChain['id'], string>;
  getChainsBadge: () => Record<ExtendedChain['id'], string | undefined>;
  getChainsPrivateMempoolTimeout: () => Record<ExtendedChain['id'], number>;
  getChainsIdByName: () => Record<string, ExtendedChain['id']>;
  getChainsGasSpeeds: () => Record<ExtendedChain['id'], GasSpeed[]>;
  getChainsPollingInterval: () => Record<ExtendedChain['id'], number>;
  getChainsFavorites: () => Record<ExtendedChain['id'], string[]>;

  getMeteorologySupportedChainIds: () => ExtendedChain['id'][];
  getSwapSupportedChainIds: () => ExtendedChain['id'][];
  getApprovalsSupportedChainIds: () => ExtendedChain['id'][];
  getTransactionsSupportedChainIds: () => ExtendedChain['id'][];
  getAssetsSupportedChainIds: () => ExtendedChain['id'][];
  getPositionsSupportedChainIds: () => ExtendedChain['id'][];
  getTokenSearchSupportedChainIds: () => ExtendedChain['id'][];
  getNftSupportedChainIds: () => ExtendedChain['id'][];
  getChainGasUnits: (chainId: ExtendedChain['id']) => ExtendedChain['metadata']['gasUnits'];

  addChain: (chain: ExtendedChain, enable: boolean) => void;
  removeChain: (chainId: ExtendedChain['id']) => void;
  addRpc: (chainId: ExtendedChain['id'], rpc: CustomRPC, setAsDefault: boolean) => void;
  setDefaultRpc: (chainId: ExtendedChain['id'], rpcUrl: string) => void;
  removeRpc: (chainId: ExtendedChain['id'], rpcUrl: string) => void;
  addAsset: (chainId: ExtendedChain['id'], asset: RainbowChainAsset) => void;
  updateAsset: (chainId: ExtendedChain['id'], asset: Partial<RainbowChainAsset>) => void;
  removeAsset: (chainId: ExtendedChain['id'], asset: RainbowChainAsset) => void;
}

type NetworkStore = NetworkState & NetworkActions;

let lastNetworks: Networks | null = null;

function createSelector<T>(selectorFn: (networks: Networks, transformed: ExtendedChain[]) => T): () => T {
  const uninitialized = Symbol();
  let cachedResult: T | typeof uninitialized = uninitialized;
  let memoizedFn: ((networks: Networks, transformed: ExtendedChain[]) => T) | null = null;

  return () => {
    const { chains, networks } = useNetworkStore.getState();

    if (cachedResult !== uninitialized && lastNetworks === networks) {
      return cachedResult;
    }

    if (lastNetworks !== networks) lastNetworks = networks;
    if (!memoizedFn) memoizedFn = selectorFn;

    cachedResult = memoizedFn(networks, chains);
    return cachedResult;
  };
}

function createParameterizedSelector<T, Args extends unknown[]>(
  selectorFn: (networks: Networks, transformed: ExtendedChain[]) => (...args: Args) => T
): (...args: Args) => T {
  const uninitialized = Symbol();
  let cachedResult: T | typeof uninitialized = uninitialized;
  let lastArgs: Args | null = null;
  let memoizedFn: ((...args: Args) => T) | null = null;

  return (...args: Args) => {
    const { chains, networks } = useNetworkStore.getState();
    const argsChanged = !lastArgs || args.length !== lastArgs.length || args.some((arg, i) => arg !== lastArgs?.[i]);

    if (cachedResult !== uninitialized && lastNetworks === networks && !argsChanged) {
      return cachedResult;
    }

    if (!memoizedFn || lastNetworks !== networks) {
      lastNetworks = networks;
      memoizedFn = selectorFn(networks, chains);
    }

    lastArgs = args;
    cachedResult = memoizedFn(...args);
    return cachedResult;
  };
}

function transformExistingStoresToExtendedChains({
  favorites, 
  rainbowChainAssets,
  rainbowChains,
  userChains,
  userChainsOrder,
}: {
  favorites: Partial<Record<ChainId, AddressOrEth[]>>;
  rainbowChainAssets: Partial<Record<ChainId, RainbowChainAsset[]>>;
  rainbowChains: Record<number, RainbowChain>;
  userChains: Record<number, boolean>;
  userChainsOrder: (number | number)[];
}): ExtendedChain[] {
  let chains: ExtendedChain[] = [];

  for (const rainbowChain of Object.values(rainbowChains)) {
    const defaultRpcUrl: string = rainbowChain.activeRpcUrl;
    let rpcs: Set<CustomRPC> = new Set();
    let chainId: number | null = null;
    let label: string | null = null;
    let chain: Chain | null = null;

    for (const chainData of rainbowChain.chains) {
      if (!chain) {
        chain = chainData;
      }
      rpcs.add({
        name: chain.name,
        blockExplorerUrl: chain.blockExplorers?.default.url || '',
        rpcUrl: chain.rpcUrls.default.http[0],
        symbol: chain.nativeCurrency.symbol,
        testnet: chain.testnet || false,
      });
      chainId = chain.id;
      label = chain.name;
    }

    if (chain && rpcs.size > 0 && chainId && label) {
      const extendedChain: ExtendedChain = {
        ...chain,
        label,
        metadata: {
          isBackendDriven: false, // infer false, this gets overwritten in `transformNetworksToExtendedChains` anyway
          enabled: userChains[chainId] || false,
          favorites: favorites[chainId]?.map(f => ({ address: f })) || [],
          assets: rainbowChainAssets[chainId] || [],
          order: userChainsOrder.indexOf(chainId) || undefined,
          defaultRPC: defaultRpcUrl,
          customRPCs: Array.from(rpcs),
          isCustom: true,
        }
      }
      chains.push(extendedChain);
    }
  }
  
  return chains;
}

export const getInitialChainsState = (): ExtendedChain[] => {
  const currentFavorites = useFavoritesStore.getState().favorites;
  const currentRainbowChains = useRainbowChainsStore.getState().rainbowChains;
  const currentRainbowChainAssets = useRainbowChainAssetsStore.getState().rainbowChainAssets;
  const { userChains, userChainsOrder } = useUserChainsStore.getState();

  // construct ExtendedChain objects from existing stores
  const existingChains = transformExistingStoresToExtendedChains({
    favorites: currentFavorites,
    rainbowChainAssets: currentRainbowChainAssets,
    rainbowChains: currentRainbowChains,
    userChains: userChains,
    userChainsOrder: userChainsOrder,
  });

  // merge any chains that overlap with backend driven chains
  let chains = transformNetworksToExtendedChains(buildTimeNetworks, existingChains);
  
  // Then, we need to add any chains that weren't in backend driven chains but locally stored
  // as user-added custom chains
  for (const chainId of differenceOrUnionOf({
    existing: chains,
    incoming: existingChains,
    valueKey: 'id',
    method: 'difference'
  }).values()) {
    const origin = existingChains.find(c => c.id === chainId);
    if (!origin) continue;
    origin.metadata.isBackendDriven = false;
    origin.metadata.isCustom = true;
    chains.push(origin);
  }

  return chains;
}

const initialState: NetworkState = {
  networks: buildTimeNetworks,
  chains: getInitialChainsState(),
};

// TODO: Things that need to be done when a change is detected:
/**
 * 1. Detect when a new backend network is added / changed
 *   - check if the new network exists already in the chains state
 *   - if it does -> merge the new network with the existing one // TODO: Define what should be kept from existing
 *   - if it doesn't -> simply add it to the chains state
 *   - flip the `isBackendDriven` flag to true
 *   - flip the `isCustom` flag to false
 *   - flip the `enabled` flag to true
 *   - modify the order of the chain if it's not already set to be alphabetically placed (if possible?)
 * 
 * 2. Detect when a new custom network is added FROM OUR CUSTOM NETWORK DATA
 *   - check if the new network exists already in the chains state
 *   - if it does -> merge the new network with the existing one // TODO: Define what should be kept from existing
 *   - if it doesn't -> simply add it to the chains state
 *   - flip the `isBackendDriven` flag to true
 *   - flip the `isCustom` flag to true (this should already be true, but just to be explicit)
 *   - NO NEED TO MODIFY THE ORDER OF THE CHAIN OR THE `enabled` FLAG
 * 
 * 3. Detect when a new custom network is added FROM THE USER
 *   - check if the new network exists already in the chains state
 *   - if it does -> simply update the existing chain with new RPC data
 *   - if it doesn't -> simply add it to the chains state
 *   - flip the `isBackendDriven` flag to false
 *   - flip the `isCustom` flag to true
 *   - flip the `enabled` flag to what the user provides
 * 
 * CRITERIA TO SHOW A NETWORK ON UI:
 *  if a network is backend driven AND not internal
 *  if a network is custom (either backend driven or user added) (regardless of internal flag)
 */

export const networkStore = createQueryStore<Networks, never, NetworkStore>(
  {
    fetcher: fetchNetworks,
    setData: ({ data, set }) => {
      set((state) => {
        let newState = { ...state };

        const backendChains = new Map(data.backendNetworks.networks.map(c => [+c.id, c]));
        const customChains = new Map(data.customNetworks.customNetworks.map(c => [+c.id, c]));
        const incomingChainIds = new Set([...backendChains.keys(), ...customChains.keys()]);
        
        for (const chainId of incomingChainIds.values()) {
          const backendNetwork = backendChains.get(+chainId);
          const customNetwork = customChains.get(+chainId);
          
          // the following two functions take care of merging data with state
          if (backendNetwork) {
            newState.chains.push(transformBackendNetworkToExtendedChain({
              network: backendNetwork,
              chains: state.chains,
            }));
          } else if (customNetwork) {
            newState.chains.push(transformCustomNetworkToExtendedChain({
              network: customNetwork,
              chains: state.chains,
            }));
          }
        }

        return newState;
      });
    },
    staleTime: 10 * 60 * 1000
  },
  
  (set) => ({
    ...initialState,

    addChain: (chain, enable) => {
      set((state) => {       
        const newChains = [...state.chains];
        if (newChains.some(c => c.id === chain.id)) {
          logger.warn(`[Chain ${chain.id} already exists`);
          return state;
        }

        // TODO: Need to fill out more metadata fields here
        const newChain: ExtendedChain = {
          ...chain,
          label: chain.name,
          metadata: {
            isBackendDriven: false,
            enabled: enable,
            isCustom: true,
          }
        };
        
        newChains.push(newChain);

        return {
          ...state,
          chains: newChains
        };
      });
    },

    removeChain: (chainId) => {
      set((state) => {
        const chain = state.chains.find(c => c.id === chainId);
        
        // Don't allow removing backend-driven chains
        if (chain?.metadata.isBackendDriven) {
          logger.warn(`[removeChain]: Cannot remove backend-driven chain ${chainId}`);
          return state;
        }

        return {
          ...state,
          chains: state.chains.filter(c => c.id !== chainId)
        };
      });
    },

    addRpc: (chainId, customRpc, setAsDefault) => {
      set((state) => {
        const newChains = [...state.chains];

        const chainIndex = newChains.findIndex(c => c.id === chainId);
        if (chainIndex === -1) {
          logger.warn(`[addRpcUrl]: Chain ${chainId} not found`);
          return state;
        }

        const chain = newChains[chainIndex];

        const alreadyExists = chain.metadata.customRPCs?.some(rpc => rpc.rpcUrl === customRpc.rpcUrl);
        if (alreadyExists) {
          logger.warn(`[addRpcUrl]: RPC ${customRpc.rpcUrl} already exists on chain ${chainId}`);
          return state;
        }

        chain.metadata.customRPCs?.push(customRpc);
        if (setAsDefault) {
          const newChain: ExtendedChain = { ...chain, rpcUrls: { default: { http: [customRpc.rpcUrl] } } };
          newChain.metadata.defaultRPC = customRpc.rpcUrl;
          newChains[chainIndex] = newChain;
        }

        return {
          ...state,
          chains: newChains
        };
      });
    },

    setDefaultRpc: (chainId, rpcUrl) => {
      set((state) => {
        const chainIndex = state.chains.findIndex(c => c.id === chainId);
        if (chainIndex === -1) {
          logger.warn(`[setDefaultRpc]: Chain ${chainId} not found`);
          return state;
        }

        const chain = state.chains[chainIndex];
        if (!chain.metadata.customRPCs?.some(rpc => rpc.rpcUrl === rpcUrl)) {
          logger.warn(`[setDefaultRpc]: RPC ${rpcUrl} not found on chain ${chainId}`);
          return state;
        }

        const newChain: ExtendedChain = { ...chain, rpcUrls: { default: { http: [rpcUrl] } } };
        newChain.metadata.defaultRPC = rpcUrl;
        state.chains[chainIndex] = newChain;
        return state;
      });
    },

    removeRpc: (chainId, rpcUrl) => {
      set((state) => {
        const newChains = [...state.chains];

        const chainIndex = newChains.findIndex(c => c.id === chainId);
        if (chainIndex === -1) {
          logger.warn(`[removeRpc]: Chain ${chainId} not found`);
          return state;
        }

        const chain = newChains[chainIndex];

        const rpcIndex = chain.metadata.customRPCs?.findIndex(rpc => rpc.rpcUrl === rpcUrl);
        if (!rpcIndex || rpcIndex === -1) {
          logger.warn(`[removeRpc]: RPC ${rpcUrl} not found on chain ${chainId}`);
          return state;
        }

        chain.metadata.customRPCs?.splice(rpcIndex, 1);
        if (chain.metadata.customRPCs?.length === 0 && chain.metadata.isCustom) {
          // if there are no RPCs left, we should remove the chain
          newChains.splice(chainIndex, 1);
          return {
            ...state,
            chains: newChains
          };
        }

        return {
          ...state,
          chains: newChains
        };
      });
    },

    addAsset: (chainId: ExtendedChain['id'], asset: RainbowChainAsset) => {
      set((state) => {
        const chain = state.chains.find(c => c.id === chainId);
        if (!chain) {
          console.warn(`Chain ${chainId} not found`);
          return state;
        }

        // Don't add duplicate assets
        if (chain.metadata.assets?.some(a => a.address === asset.address)) {
          console.warn(`Asset ${asset.address} already exists on chain ${chainId}`);
          return state;
        }

        const updates = {
          metadata: {
            ...chain.metadata,
            assets: [...(chain.metadata.assets || []), asset]
          }
        };

        return {
          ...state,
          chains: updateChainInList(state.chains, chainId, updates, mergeChain)
        };
      });
    },

    updateAsset: (chainId: ExtendedChain['id'], updates: Partial<RainbowChainAsset>) => {
      set((state) => {
        const chain = state.chains.find(c => c.id === chainId);
        if (!chain) {
          console.warn(`Chain ${chainId} not found`);
          return state;
        }

        if (!updates.address || !chain.metadata.assets?.some(a => a.address === updates.address)) {
          console.warn(`Asset ${updates.address} not found on chain ${chainId}`);
          return state;
        }

        const updatedAssets = chain.metadata.assets.map(asset => 
          asset.address === updates.address ? { ...asset, ...updates } : asset
        );

        const chainUpdates = {
          metadata: {
            ...chain.metadata,
            assets: updatedAssets
          }
        };

        return {
          ...state,
          chains: updateChainInList(state.chains, chainId, chainUpdates, mergeChain)
        };
      });
    },

    removeAsset: (chainId: ExtendedChain['id'], asset: RainbowChainAsset) => {
      set((state) => {
        const chain = state.chains.find(c => c.id === chainId);
        if (!chain) {
          console.warn(`Chain ${chainId} not found`);
          return state;
        }

        if (!chain.metadata.assets?.some(a => a.address === asset.address)) {
          console.warn(`Asset ${asset.address} not found on chain ${chainId}`);
          return state;
        }

        const updates = {
          metadata: {
            ...chain.metadata,
            assets: chain.metadata.assets.filter(a => a.address !== asset.address)
          }
        };

        return {
          ...state,
          chains: updateChainInList(state.chains, chainId, updates, mergeChain)
        };
      });
    },

    getEnabledChains: createSelector((_, chains) => {
      return chains.filter(chain => {
        if (chain.metadata.isCustom) {
          return chain.metadata.enabled;
        }
        return chain.metadata.isBackendDriven && !chain.metadata.internal;
      })
    }),

    getEnabledChainIds: createSelector((_, chains) => {
      return chains.filter(chain => chain.metadata.enabled).map(chain => chain.id);
    }),

    getBackendDrivenChains: createSelector((_, chains) => {
      return chains.filter(chain => chain.metadata.isBackendDriven);
    }),

    getBackendDrivenChainIds: createSelector((_, chains) => {
      return chains.filter(chain => chain.metadata.isBackendDriven).map(chain => chain.id);
    }),

    getCustomChains: createSelector((_, chains) => {
      return chains.filter(chain => chain.metadata.isCustom);
    }),

    getCustomChainIds: createSelector((_, chains) => {
      return chains.filter(chain => chain.metadata.isCustom).map(chain => chain.id);
    }),

    getMainnetChains: createSelector((_, chains) => {
      return chains.filter(chain => !chain.testnet);
    }),

    getMainnetChainIds: createSelector((_, chains) => {
      return chains.filter(chain => !chain.testnet).map(chain => chain.id);
    }),

    getChainById: createParameterizedSelector((_, chains) => {
      return (chainId: ExtendedChain['id']) => {
        return chains.find(chain => chain.id === chainId);
      }
    }),

    getNeedsL1SecurityFeeChains: createSelector((_, chains) => {
      return chains.filter(chain => chain.metadata.opStack).map(chain => chain.id);
    }),

    getChainsNativeAsset: createSelector((_, chains) => {
      return chains.map(chain => chain.metadata.nativeAsset);
    }),

    getChainsLabel: createSelector((_, chains) => {
      return chains.map(chain => chain.label);
    }),

    getChainsName: createSelector((_, chains) => {
      return chains.map(chain => chain.name);
    }),

    getChainsBadge: createSelector((_, chains) => {
      return chains.map(chain => chain.metadata.badgeUrl);
    }),

    getChainsPrivateMempoolTimeout: createSelector((_, chains) => {
      return chains.map(chain => chain.metadata.privateMempoolTimeout || DEFAULT_PRIVATE_MEMPOOL_TIMEOUT);
    }),

    getChainsIdByName: createSelector((_, chains) => {
      return chains.reduce((acc, chain) => {
        acc[chain.name] = chain.id;
        return acc;
      }, {} as Record<string, ExtendedChain['id']>);
    }),

    getChainsGasSpeeds: createSelector((_, chains) => {
      return chains.reduce((acc, chain) => {
        acc[chain.id] = getDefaultGasSpeeds(chain.id);
        return acc;
      }, {} as Record<ExtendedChain['id'], GasSpeed[]>);
    }),

    getChainsPollingInterval: createSelector((_, chains) => {
      return chains.reduce((acc, chain) => {
        acc[chain.id] = getDefaultPollingInterval(chain.id);
        return acc;
      }, {} as Record<ExtendedChain['id'], number>);
    }),

    getChainsFavorites: createSelector((_, chains) => {
      return chains.reduce((acc, chain) => {
        acc[chain.id] = chain.metadata.favorites?.map(favorite => favorite.address) ?? [];
        return acc;
      }, {} as Record<ExtendedChain['id'], string[]>);
    }),

    getMeteorologySupportedChainIds: createSelector((_, chains) => {
      return chains.filter(chain => chain.metadata.enabledServices?.meteorology.enabled).map(chain => chain.id);
    }),

    getSwapSupportedChainIds: createSelector((_, chains) => {
      return chains.filter(chain => chain.metadata.enabledServices?.swap.enabled).map(chain => chain.id);
    }),

    getApprovalsSupportedChainIds: createSelector((_, chains) => {
      return chains.filter(chain => chain.metadata.enabledServices?.addys.approvals).map(chain => chain.id);
    }),

    getTransactionsSupportedChainIds: createSelector((_, chains) => {
      return chains.filter(chain => chain.metadata.enabledServices?.addys.transactions).map(chain => chain.id);
    }),

    getAssetsSupportedChainIds: createSelector((_, chains) => {
      return chains.filter(chain => chain.metadata.enabledServices?.addys.assets).map(chain => chain.id);
    }),

    getPositionsSupportedChainIds: createSelector((_, chains) => {
      return chains.filter(chain => chain.metadata.enabledServices?.addys.positions).map(chain => chain.id);
    }),

    getTokenSearchSupportedChainIds: createSelector((_, chains) => {
      return chains.filter(chain => chain.metadata.enabledServices?.tokenSearch.enabled).map(chain => chain.id);
    }),

    getNftSupportedChainIds: createSelector((_, chains) => {
      return chains.filter(chain => chain.metadata.enabledServices?.nftProxy.enabled).map(chain => chain.id);
    }),

    getChainGasUnits: createParameterizedSelector((_, chains) => {
      return (chainId: ExtendedChain['id']) => {
        return chains.find(chain => chain.id === chainId)?.metadata.gasUnits;
      }
    }),
  }),
  {
    partialize: (state) => ({
      networks: state.networks,
      chains: state.chains,
    }),
    storageKey: 'networkStore',
    version: 1
  }
);

export const useNetworkStore = create(networkStore);

/** -----------------------------------------------------------------------------------
 *  Backend networks helper functions.
 *  Some of these defaults, e.g. gas speeds, should eventually come from the backend.
 * ------------------------------------------------------------------------------------*/

function getDefaultGasSpeeds(chainId: ChainId): GasSpeed[] {
  switch (chainId) {
    case ChainId.bsc:
    case ChainId.polygon:
      return [GasSpeed.NORMAL, GasSpeed.FAST, GasSpeed.URGENT];
    case ChainId.gnosis:
      return [GasSpeed.NORMAL];
    default:
      return [GasSpeed.NORMAL, GasSpeed.FAST, GasSpeed.URGENT, GasSpeed.CUSTOM];
  }
}

function getDefaultPollingInterval(chainId: ChainId): number {
  switch (chainId) {
    case ChainId.polygon:
      return 2_000;
    case ChainId.arbitrum:
    case ChainId.bsc:
      return 3_000;
    default:
      return 5_000;
  }
}

/**
 * Things that can be modified by the user:
 * 1. RPC URLs (including setting the active RPC URL)
 * 2. Custom Assets
 * 3. Favorites
 * 4. Enabling / Disabling
 */
function mergeChain(existing: ExtendedChain, incoming: Partial<ExtendedChain>): ExtendedChain {
  if (!incoming.metadata) return existing;
  
  return {
    ...existing,
    metadata: {
      ...existing.metadata,
      ...incoming.metadata,
      assets: mergeArrays(existing.metadata.assets, incoming.metadata.assets, 'address'),
      defaultRPC: mergePrimitive(existing.metadata.defaultRPC, incoming.metadata.defaultRPC),
      customRPCs: mergeArrays(existing.metadata.customRPCs, incoming.metadata.customRPCs),
      favorites: mergeArrays(existing.metadata.favorites, incoming.metadata.favorites, 'address'),
    },
  }
}

function updateChainInList(chains: ExtendedChain[], chainId: ExtendedChain['id'], updates: Partial<ExtendedChain>, mergeFn: (existing: ExtendedChain, updates: Partial<ExtendedChain>) => ExtendedChain): ExtendedChain[] {
  const existingIndex = chains.findIndex(c => c.id === chainId);
  if (existingIndex === -1 || !chains[existingIndex]) {
    logger.warn(`[updateChainInList]: Chain ${chainId} not found in list`);
    return chains;
  }

  const updated = [...chains];
  updated[existingIndex] = mergeFn(chains[existingIndex], updates);
  return updated;
}