import isEqual from 'lodash/isEqual';
import { type Chain } from 'viem/chains';

import buildTimeNetworks from 'static/data/networks.json';
import {
  BackendNetworksResponse,
  fetchNetworks,
} from '~/core/resources/backendNetworks/backendNetworks';
import { transformBackendNetworksToChains, transformCustomNetworkToBackendNetwork, toChainId } from '~/core/state/backendNetworks/utils';
import { createQueryStore } from '~/core/state/internal/createQueryStore';
import { BackendNetwork, ChainId } from '~/core/types/chains';

const { CUSTOM_NETWORKS_QUERY } = require('../../resources/backendNetworks/sharedQueries');

const INITIAL_CUSTOM_NETWORKS = buildTimeNetworks.customNetworks;

/**
 * @deprecated - these will be moved to custom backend networks soon
 */
const TESTNETS: BackendNetwork<true>[] = [
  {
    id: 1,
    name: 'Anvil Mainnet Fork',
    nativeAsset: {
      name: 'Anvil ETH',
      symbol: 'ETH',
      decimals: 18,
      iconURL: '',
    },
    rpcUrls: {
      default: { http: ['http://127.0.0.1:8545'] },
    },
    testnet: {
      FaucetURL: '',
      isTestnet: true,
      mainnetChainID: ChainId.mainnet,
    },
  },
  {
    id: 31337,
    name: 'Anvil (Dev)',
    nativeAsset: {
      name: 'Anvil ETH',
      symbol: 'ETH',
      decimals: 18,
      iconURL: '',
    },
    rpcUrls: {
      default: { http: ['http://127.0.0.1:8545'] },
    },
    testnet: {
      FaucetURL: '',
      isTestnet: true,
      mainnetChainID: ChainId.mainnet,
    },
  },
  {
    id: 1,
    name: 'Hardhat Mainnet Fork',
    nativeAsset: {
      name: 'Hardhat ETH',
      symbol: 'ETH',
      decimals: 18,
      iconURL: '',
    },
    rpcUrls: {
      default: { http: ['http://127.0.0.1:8545'] },
    },
    testnet: {
      FaucetURL: '',
      isTestnet: true,
      mainnetChainID: ChainId.mainnet,
    },
  },
  {
    id: 31337,
    name: 'Hardhat (Dev)',
    nativeAsset: {
      name: 'Hardhat ETH',
      symbol: 'ETH',
      decimals: 18,
      iconURL: '',
    },
    rpcUrls: {
      default: { http: ['http://127.0.0.1:8545'] },
    },
    testnet: {
      FaucetURL: '',
      isTestnet: true,
      mainnetChainID: ChainId.mainnet,
    },
  },
].map(network => transformCustomNetworkToBackendNetwork({ ...network, iconURL: '', defaultRPCURL: network.rpcUrls.default.http[0], defaultExplorerURL: '' }));

let lastNetworks: BackendNetworksResponse<true> | null = null;

function createSelector<T>(
  selectorFn: (
    networks: BackendNetworksResponse<true>,
    transformed: Chain[],
  ) => T,
): () => T {
  const uninitialized = Symbol();
  let cachedResult: T | typeof uninitialized = uninitialized;
  let memoizedFn:
    | ((
        networks: BackendNetworksResponse<true>,
        transformed: Chain[],
      ) => T)
    | null = null;

  return () => {
    const { customChains, customNetworks } =
      useCustomNetworksStore.getState();

    if (
      cachedResult !== uninitialized &&
      lastNetworks === customNetworks
    ) {
      return cachedResult;
    }

    if (lastNetworks !== customNetworks) lastNetworks = customNetworks;
    if (!memoizedFn) memoizedFn = selectorFn;

    cachedResult = memoizedFn(customNetworks, customChains);
    return cachedResult;
  };
}

export interface CustomNetworksState {
  customChains: Chain[];
  customNetworks: BackendNetworksResponse<true>;

  getSortedSupportedChains: () => Chain[];
  getChainsName: () => Record<ChainId, string>;
  getChainsBadge: () => Record<ChainId, string>;
  getChainsFaucet: () => Record<ChainId, string>;
}
export const useCustomNetworksStore = createQueryStore<
  BackendNetworksResponse<true>,
  never,
  CustomNetworksState
>(
  {
    fetcher: () => fetchNetworks<true>(CUSTOM_NETWORKS_QUERY),
    setData: ({ data, set }) => {
      set((state) => {
        const networks = data.networks.concat(TESTNETS);
        if (isEqual(state.customNetworks, networks)) return state;

        return {
          customChains: transformBackendNetworksToChains<true>(networks),
          customNetworks: {
            networks,
          },
        };
      });
    },
    staleTime: 10 * 60 * 1_000,
  },

  () => ({
    customChains: transformBackendNetworksToChains(
        INITIAL_CUSTOM_NETWORKS.customNetworks.map(transformCustomNetworkToBackendNetwork),
    ),
    customNetworks: {
        networks: INITIAL_CUSTOM_NETWORKS.customNetworks.map(transformCustomNetworkToBackendNetwork),
    },

    getSortedSupportedChains: createSelector(
      (_, transformed) => {
        return transformed
          .sort((a, b) => a.name.localeCompare(b.name))
      },
    ),

    getChainsName: createSelector((networks) =>
      networks.networks.reduce(
        (acc, customNetwork) => {
          acc[toChainId(customNetwork.id)] = customNetwork.name;
          return acc;
        },
        {} as Record<ChainId, string>,
      ),
    ),

    getChainsBadge: createSelector((networks) =>
      networks.networks.reduce(
        (acc, customNetwork) => {
          acc[toChainId(customNetwork.id)] = customNetwork.icons.badgeURL;
          return acc;
        },
        {} as Record<ChainId, string>,
      ),
    ),

    getChainsFaucet: createSelector((networks) =>
      networks.networks.reduce(
        (acc, customNetwork) => {
          acc[toChainId(customNetwork.id)] = customNetwork.testnetFaucet ?? '';
          return acc;
        },
        {} as Record<ChainId, string>,
      ),
    ),
  }),
  {
    partialize: (state) => ({
      customChains: state.customChains,
      customNetworks: state.customNetworks,
    }),
    storageKey: 'customNetworks',
  },
);
