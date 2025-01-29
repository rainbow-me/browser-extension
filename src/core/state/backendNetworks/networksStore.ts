import { Chain } from 'viem/chains';
import { create } from 'zustand';
import equal from 'react-fast-compare';

import { fetchNetworks, Networks } from '~/core/resources/backendNetworks/backendNetworks';
import { createQueryStore } from '~/core/state/internal/createQueryStore';
import { ExtendedChainMetadata } from '~/core/types/chains';
import buildTimeNetworks from 'static/data/networks.json';
import { transformNetworksToExtendedChains } from './utils';
import { GasSpeed } from '~/core/types/gas';

export interface ExtendedChain extends Chain {
  metadata: ExtendedChainMetadata;
}

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
  getChainsBadge: () => Record<ExtendedChain['id'], string>;
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
  getTokenSearchSupportedChainIds: () => ExtendedChain['id'][];
  getNftSupportedChainIds: () => ExtendedChain['id'][];
  getChainGasUnits: (chainId: ExtendedChain['id']) => ExtendedChain['metadata']['gasUnits'];
  getChainDefaultRpc: (chainId: ExtendedChain['id']) => string;
}

type NetworkStore = NetworkState & NetworkActions;

const initialState: NetworkState = {
  networks: buildTimeNetworks,
  chains: transformNetworksToExtendedChains(buildTimeNetworks),
};

// Store creation
export const networkStore = createQueryStore<Networks, never, NetworkStore>(
  {
    fetcher: fetchNetworks,
    setData: ({ data, set }) => {
      set((state) => {
        if (equal(state.networks, data)) return state;

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


        return {
          ...state,
          chains: transformNetworksToExtendedChains(data, state.chains),
        };
      });
    },
    staleTime: 10 * 60 * 1000
  },
  
  (_, get) => ({
    ...initialState,

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
      return chains.filter(chain => chain.metadata.label);
    },

    getChainsNativeAsset: () => {
      const { chains } = get();
      return chains.map(chain => chain.metadata.nativeAsset);
    },

    getChainsLabel: () => {
      const { chains } = get();
      return chains.map(chain => chain.metadata.);
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