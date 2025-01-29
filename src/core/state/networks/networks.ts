import { create } from 'zustand';
import equal from 'react-fast-compare';

import { fetchNetworks } from '~/core/resources/networks/networks';
import { createQueryStore } from '~/core/state/internal/createQueryStore';
import { ChainId, ExtendedChain, Networks } from '~/core/types/chains';  
import buildTimeNetworks from 'static/data/networks.json';
import { transformNetworksToExtendedChains } from './utils';
import { GasSpeed } from '~/core/types/gas';
import { DEFAULT_PRIVATE_MEMPOOL_TIMEOUT } from '~/core/utils/networks';
import { RainbowChainAsset } from '../rainbowChainAssets';
import { logger } from '~/logger';
import { Chain } from 'viem';

interface NetworkState {
	// encapsulates backend networks and custom networks (just backend driven custom networks)
  networks: Networks; 
  // backend driven, custom networks, and user-added networks
  chains: ExtendedChain[];
}

interface NetworkActions {
  addCustomChain: (chain: ExtendedChain) => void;
  updateCustomChain: (chainId: ExtendedChain['id'], updates: Partial<ExtendedChain>) => void;
  removeCustomChain: (chainId: ExtendedChain['id']) => void;
  addRpcUrl: (chainId: ExtendedChain['id'], rpcUrl: string) => void;
  removeRpcUrl: (chainId: ExtendedChain['id'], rpcUrl: string) => void;
  addCustomAsset: (chainId: ExtendedChain['id'], asset: RainbowChainAsset) => void;
  updateCustomAsset: (chainId: ExtendedChain['id'], asset: Partial<RainbowChainAsset>) => void;
  removeCustomAsset: (chainId: ExtendedChain['id'], asset: RainbowChainAsset) => void;
  

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
}

type NetworkStore = NetworkState & NetworkActions;

const initialState: NetworkState = {
  networks: buildTimeNetworks,
  chains: transformNetworksToExtendedChains(buildTimeNetworks),
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
        // TODO: Diff and merge backend networks
        if (!equal(state.networks.backendNetworks, data.backendNetworks)) {}

        // TODO: Diff and merge custom networks
        if (!equal(state.networks.customNetworks, data.customNetworks)) {}

        // no state changes, just return state
        return newState;
      });
    },
    staleTime: 10 * 60 * 1000
  },
  
  (set, get) => ({
    ...initialState,

    addCustomChain: (chain: Chain) => {
      set((state) => {        
        return {
          ...state,
          chains: updateChainInList(state.chains, chain.id, chain, mergeChain)
        };
      });
    },

    updateCustomChain: (chainId: ExtendedChain['id'], updates: Partial<ExtendedChain>) => {
      set((state) => {
        const existingChain = state.chains.find(c => c.id === chainId);
        
        // Don't allow updating backend-driven chains
        if (existingChain?.metadata.isBackendDriven) {
          console.warn(`Cannot update backend-driven chain ${chainId}`);
          return state;
        }

        if (!existingChain) {
          console.warn(`Chain ${chainId} not found`);
          return state;
        }

        return {
          ...state,
          chains: updateChainInList(state.chains, chainId, updates, mergeChain)
        };
      });
    },

    removeCustomChain: (chainId: ExtendedChain['id']) => {
      set((state) => {
        const chain = state.chains.find(c => c.id === chainId);
        
        // Don't allow removing backend-driven chains
        if (chain?.metadata.isBackendDriven) {
          console.warn(`Cannot remove backend-driven chain ${chainId}`);
          return state;
        }

        return {
          ...state,
          chains: state.chains.filter(c => c.id !== chainId)
        };
      });
    },

    addRpcUrl: (chainId: ExtendedChain['id'], rpcUrl: string) => {
      set((state) => {
        const chain = state.chains.find(c => c.id === chainId);
        if (!chain) {
          console.warn(`Chain ${chainId} not found`);
          return state;
        }

        // Don't add duplicate URLs
        if (chain.rpcUrls.default.http.includes(rpcUrl)) {
          return state;
        }

        const updates = {
          rpcUrls: {
            ...chain.rpcUrls,
            default: {
              ...chain.rpcUrls.default,
              http: [...chain.rpcUrls.default.http, rpcUrl]
            }
          }
        };

        return {
          ...state,
          chains: updateChainInList(state.chains, chainId, updates, mergeChain)
        };
      });
    },

    removeRpcUrl: (chainId: ExtendedChain['id'], rpcUrl: string) => {
      set((state) => {
        const chain = state.chains.find(c => c.id === chainId);
        if (!chain) {
          console.warn(`Chain ${chainId} not found`);
          return state;
        }

        // Don't remove if URL doesn't exist
        if (!chain.rpcUrls.default.http.includes(rpcUrl)) {
          return state;
        }

        // If it's the last RPC url, let's remove the chain (if it's custom)
        if (chain.rpcUrls.default.http.length <= 1) {
          if (!chain.metadata.isCustom) {
            logger.warn(`[removeRpcUrl]: Cannot remove last RPC URL for backend-driven chain ${chainId}`);
            return state;
          }

          return {
            ...state,
            chains: state.chains.filter(c => c.id !== chainId)
          };
        }

        const updates = {
          rpcUrls: {
            ...chain.rpcUrls,
            default: {
              ...chain.rpcUrls.default,
              http: chain.rpcUrls.default.http.filter(url => url !== rpcUrl)
            }
          }
        };

        return {
          ...state,
          chains: updateChainInList(state.chains, chainId, updates, mergeChain)
        };
      });
    },

    addCustomAsset: (chainId: ExtendedChain['id'], asset: RainbowChainAsset) => {
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

    updateCustomAsset: (chainId: ExtendedChain['id'], updates: Partial<RainbowChainAsset>) => {
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

    removeCustomAsset: (chainId: ExtendedChain['id'], asset: RainbowChainAsset) => {
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

    getEnabledChains: () => {
      const { chains } = get();
      return chains.filter(chain => {
        if (chain.metadata.isCustom) {
          return chain.metadata.enabled;
        }
        return chain.metadata.isBackendDriven && !chain.metadata.internal;
      })
    },

    getEnabledChainIds: () => {
      const { getEnabledChains } = get();
      return getEnabledChains().map(chain => chain.id);
    },

    getBackendDrivenChains: () => {
      const { chains } = get();
      return chains.filter(chain => chain.metadata.isBackendDriven);
    },

    getBackendDrivenChainIds: () => {
      const { getBackendDrivenChains } = get();
      return getBackendDrivenChains().map(chain => chain.id);
    },

    getCustomChains: () => {
      const { chains } = get();
      return chains.filter(chain => chain.metadata.isCustom);
    },

    getCustomChainIds: () => {
      const { getCustomChains } = get();
      return getCustomChains().map(chain => chain.id);
    },

    getMainnetChains: () => {
      const { chains } = get();
      return chains.filter(chain => !chain.testnet);
    },

    getMainnetChainIds: () => {
      const { getMainnetChains } = get();
      return getMainnetChains().map(chain => chain.id);
    },

    getChainById: (chainId: ExtendedChain['id']) => {
      return get().chains.find(chain => chain.id === chainId);
    },

    getNeedsL1SecurityFeeChains: () => {
      const { chains } = get();
      return chains.filter(chain => chain.metadata.label).map(chain => chain.id);
    },

    getChainsNativeAsset: () => {
      const { chains } = get();
      return chains.map(chain => chain.metadata.nativeAsset);
    },

    getChainsLabel: () => {
      const { chains } = get();
      return chains.map(chain => chain.label);
    },

    getChainsName: () => {
      const { chains } = get();
      return chains.map(chain => chain.name);
    },

    getChainsBadge: () => {
      const { chains } = get();
      return chains.map(chain => chain.metadata.badgeUrl);
    },

    getChainsPrivateMempoolTimeout: () => {
      const { chains } = get();
      return chains.map(chain => chain.metadata.privateMempoolTimeout || DEFAULT_PRIVATE_MEMPOOL_TIMEOUT);
    },

    getChainsIdByName: () => {
      const { chains } = get();
      return chains.reduce((acc, chain) => {
        acc[chain.name] = chain.id;
        return acc;
      }, {} as Record<string, ExtendedChain['id']>);
    },

    getChainsGasSpeeds: () => {
      const { chains } = get();
      return chains.reduce((acc, chain) => {
        acc[chain.id] = getDefaultGasSpeeds(chain.id);
        return acc;
      }, {} as Record<ExtendedChain['id'], GasSpeed[]>);
    },

    getChainsPollingInterval: () => {
      const { chains } = get();
      return chains.reduce((acc, chain) => {
        acc[chain.id] = getDefaultPollingInterval(chain.id);
        return acc;
      }, {} as Record<ExtendedChain['id'], number>);
    },

    getChainsFavorites: () => {
      const { chains } = get();
      return chains.reduce((acc, chain) => {
        acc[chain.id] = chain.metadata.favorites?.map(favorite => favorite.address) ?? [];
        return acc;
      }, {} as Record<ExtendedChain['id'], string[]>);
    },

    getMeteorologySupportedChainIds: () => {
      const { chains } = get();
      return chains.filter(chain => chain.metadata.enabledServices?.meteorology.enabled).map(chain => chain.id);
    },

    getSwapSupportedChainIds: () => {
      const { chains } = get();
      return chains.filter(chain => chain.metadata.enabledServices?.swap.enabled).map(chain => chain.id);
    },

    getApprovalsSupportedChainIds: () => {
      const { chains } = get();
      return chains.filter(chain => chain.metadata.enabledServices?.addys.approvals).map(chain => chain.id);
    },

    getTransactionsSupportedChainIds: () => {
      const { chains } = get();
      return chains.filter(chain => chain.metadata.enabledServices?.addys.transactions).map(chain => chain.id);
    },

    getAssetsSupportedChainIds: () => {
      const { chains } = get();
      return chains.filter(chain => chain.metadata.enabledServices?.addys.assets).map(chain => chain.id);
    },

    getPositionsSupportedChainIds: () => {
      const { chains } = get();
      return chains.filter(chain => chain.metadata.enabledServices?.addys.positions).map(chain => chain.id);
    },

    getTokenSearchSupportedChainIds: () => {
      const { chains } = get();
      return chains.filter(chain => chain.metadata.enabledServices?.tokenSearch.enabled).map(chain => chain.id);
    },

    getNftSupportedChainIds: () => {
      const { chains } = get();
      return chains.filter(chain => chain.metadata.enabledServices?.nftProxy.enabled).map(chain => chain.id);
    },

    getChainGasUnits: (chainId: ExtendedChain['id']) => {
      const { chains } = get();
      return chains.find(chain => chain.id === chainId)?.metadata.gasUnits;
    },
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

function mergeChain(existing: ExtendedChain, updates: Partial<ExtendedChain>): ExtendedChain {
  return {
    ...existing,
    ...updates,
    metadata: {
      ...existing.metadata,
      ...updates.metadata,
    },
  };
}

function updateChainInList(chains: ExtendedChain[], chainId: ExtendedChain['id'], updates: Partial<ExtendedChain>, mergeFn: (existing: ExtendedChain, updates: Partial<ExtendedChain>) => ExtendedChain): ExtendedChain[] {
  const existingIndex = chains.findIndex(c => c.id === chainId);
  if (existingIndex === -1) {
    logger.warn(`[updateChainInList]: Chain ${chainId} not found in list`);
    return chains;
  }

  const existingChain = chains[existingIndex];
  if (!existingChain) {
    logger.warn(`[updateChainInList]: Chain ${chainId} not found in list`);
    return chains;
  }

  const updated = [...chains];
  updated[existingIndex] = mergeFn(existingChain, updates);
  return updated;
}