import isEqual from 'lodash/isEqual';
import { type Chain, avalancheFuji, curtis, inkSepolia } from 'viem/chains';

import buildTimeNetworks from 'static/data/networks.json';
import {
  BackendNetworksResponse,
  fetchNetworks,
} from '~/core/resources/backendNetworks/backendNetworks';

import { transformBackendNetworksToChains } from '~/core/state/backendNetworks/utils';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { createQueryStore } from '~/core/state/internal/createQueryStore';
import {
  BackendNetwork,
  BackendNetworkServices,
  ChainId,
  chainHardhat,
  chainHardhatOptimism,
} from '~/core/types/chains';
import { GasSpeed } from '~/core/types/gas';

const { BACKEND_NETWORKS_QUERY } = require('../../resources/backendNetworks/sharedQueries');

const INITIAL_BACKEND_NETWORKS = buildTimeNetworks.backendNetworks;
const DEFAULT_PRIVATE_MEMPOOL_TIMEOUT = 2 * 60 * 1_000;
const LOCAL_CHAINS: Chain[] = [
  avalancheFuji,
  curtis,
  inkSepolia,
  chainHardhat,
  chainHardhatOptimism,
];

export interface BackendNetworksState {
  backendChains: Chain[];
  backendNetworks: BackendNetworksResponse;

  getSupportedChains: () => Chain[];
  getSortedSupportedChainIds: () => number[];

  getDefaultChains: () => Record<ChainId, Chain>;
  getSupportedChainIds: () => ChainId[];
  getSupportedMainnetChains: () => Chain[];
  getSupportedMainnetChainIds: () => ChainId[];
  getNeedsL1SecurityFeeChains: () => ChainId[];
  getChainsNativeAsset: () => Record<ChainId, BackendNetwork['nativeAsset']>;
  getChainsLabel: () => Record<ChainId, string>;
  getChainsPrivateMempoolTimeout: () => Record<ChainId, number>;
  getChainsName: () => Record<ChainId, string>;
  getChainsBadge: () => Record<ChainId, string>;
  getChainsIdByName: () => Record<string, ChainId>;

  getChainsGasSpeeds: () => Record<ChainId, GasSpeed[]>;
  getChainsPollingInterval: () => Record<ChainId, number>;

  getChainsSimplehashNetwork: () => Record<ChainId, string>;
  filterChainIdsByService: (
    servicePath: (services: BackendNetworkServices) => boolean,
  ) => ChainId[];

  getMeteorologySupportedChainIds: () => ChainId[];
  getSwapSupportedChainIds: () => ChainId[];
  getApprovalsSupportedChainIds: () => ChainId[];
  getTransactionsSupportedChainIds: () => ChainId[];
  getSupportedAssetsChainIds: () => ChainId[];
  getSupportedPositionsChainIds: () => ChainId[];
  getTokenSearchSupportedChainIds: () => ChainId[];
  getNftSupportedChainIds: () => ChainId[];
  getFlashbotsSupportedChainIds: () => ChainId[];
  getShouldDefaultToFastGasChainIds: () => ChainId[];

  getChainGasUnits: (chainId?: ChainId) => BackendNetwork['gasUnits'];
  getChainDefaultRpc: (chainId: ChainId) => string;
}

let lastNetworks: BackendNetworksResponse | null = null;
let lastTestnetMode: boolean | null = null;

function createSelector<T>(
  selectorFn: (
    networks: BackendNetworksResponse,
    transformed: Chain[],
    testnetMode: boolean,
  ) => T,
): () => T {
  const uninitialized = Symbol();
  let cachedResult: T | typeof uninitialized = uninitialized;
  let memoizedFn:
    | ((
        networks: BackendNetworksResponse,
        transformed: Chain[],
        testnetMode: boolean,
      ) => T)
    | null = null;

  return () => {
    const { backendChains, backendNetworks } =
      useBackendNetworksStore.getState();
    const { testnetMode } = useTestnetModeStore.getState();

    if (
      cachedResult !== uninitialized &&
      lastNetworks === backendNetworks &&
      lastTestnetMode === testnetMode
    ) {
      return cachedResult;
    }

    if (lastNetworks !== backendNetworks) lastNetworks = backendNetworks;
    if (lastTestnetMode !== testnetMode) lastTestnetMode = testnetMode;
    if (!memoizedFn) memoizedFn = selectorFn;

    cachedResult = memoizedFn(backendNetworks, backendChains, testnetMode);
    return cachedResult;
  };
}

function createParameterizedSelector<T, Args extends unknown[]>(
  selectorFn: (
    networks: BackendNetworksResponse,
    transformed: Chain[],
  ) => (...args: Args) => T,
): (...args: Args) => T {
  const uninitialized = Symbol();
  let cachedResult: T | typeof uninitialized = uninitialized;
  let lastArgs: Args | null = null;
  let memoizedFn: ((...args: Args) => T) | null = null;

  return (...args: Args) => {
    const { backendChains, backendNetworks } =
      useBackendNetworksStore.getState();
    const argsChanged =
      !lastArgs ||
      args.length !== lastArgs.length ||
      args.some((arg, i) => arg !== lastArgs?.[i]);

    if (
      cachedResult !== uninitialized &&
      lastNetworks === backendNetworks &&
      !argsChanged
    ) {
      return cachedResult;
    }

    if (!memoizedFn || lastNetworks !== backendNetworks) {
      lastNetworks = backendNetworks;
      memoizedFn = selectorFn(backendNetworks, backendChains);
    }

    lastArgs = args;
    cachedResult = memoizedFn(...args);
    return cachedResult;
  };
}

export const useBackendNetworksStore = createQueryStore<
  BackendNetworksResponse,
  never,
  BackendNetworksState
>(
  {
    fetcher: () => fetchNetworks(BACKEND_NETWORKS_QUERY),
    setData: ({ data, set }) => {
      set((state) => {
        if (isEqual(state.backendNetworks, data)) return state;

        return {
          backendChains: transformBackendNetworksToChains(data.networks),
          backendNetworks: data,
        };
      });
    },
    staleTime: 10 * 60 * 1_000,
  },

  (_, get) => ({
    backendChains: transformBackendNetworksToChains(
      INITIAL_BACKEND_NETWORKS.networks,
    ),
    backendNetworks: INITIAL_BACKEND_NETWORKS,

    getSupportedChains: createSelector((_, transformed, testnetMode) => {
      return testnetMode ? [...transformed, ...LOCAL_CHAINS] : transformed;
    }),

    getSortedSupportedChainIds: createSelector(
      (_, transformed, testnetMode) => {
        const allChains = testnetMode
          ? [...transformed, ...LOCAL_CHAINS]
          : transformed;
        return allChains
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((c) => c.id);
      },
    ),

    getDefaultChains: createSelector((_, transformed, testnetMode) => {
      const allChains = testnetMode
        ? [...transformed, ...LOCAL_CHAINS]
        : transformed;
      return allChains.reduce(
        (acc, chain) => {
          acc[chain.id] = chain;
          return acc;
        },
        {} as Record<ChainId, Chain>,
      );
    }),

    getSupportedChainIds: createSelector((_, transformed, testnetMode) => {
      const allChains = testnetMode
        ? [...transformed, ...LOCAL_CHAINS]
        : transformed;
      return allChains.map((chain) => chain.id);
    }),

    getSupportedMainnetChains: createSelector((_, transformed, testnetMode) => {
      const allChains = testnetMode
        ? [...transformed, ...LOCAL_CHAINS]
        : transformed;
      return allChains.filter((chain) => !chain.testnet);
    }),

    getSupportedMainnetChainIds: createSelector(
      (_, transformed, testnetMode) => {
        const allChains = testnetMode
          ? [...transformed, ...LOCAL_CHAINS]
          : transformed;
        return allChains
          .filter((chain) => !chain.testnet)
          .map((chain) => chain.id);
      },
    ),

    getNeedsL1SecurityFeeChains: createSelector((networks) =>
      networks.networks
        .filter((backendNetwork: BackendNetwork) => backendNetwork.opStack)
        .map((backendNetwork: BackendNetwork) => toChainId(backendNetwork.id)),
    ),

    getChainsNativeAsset: createSelector((networks) =>
      networks.networks.reduce(
        (acc, backendNetwork) => {
          acc[toChainId(backendNetwork.id)] = backendNetwork.nativeAsset;
          return acc;
        },
        {} as Record<ChainId, BackendNetwork['nativeAsset']>,
      ),
    ),

    getChainsLabel: createSelector((networks) =>
      networks.networks.reduce(
        (acc, backendNetwork) => {
          acc[toChainId(backendNetwork.id)] = backendNetwork.label;
          return acc;
        },
        {} as Record<ChainId, string>,
      ),
    ),

    getChainsPrivateMempoolTimeout: createSelector((networks) =>
      networks.networks.reduce(
        (acc, backendNetwork) => {
          acc[toChainId(backendNetwork.id)] =
            backendNetwork.privateMempoolTimeout ||
            DEFAULT_PRIVATE_MEMPOOL_TIMEOUT;
          return acc;
        },
        {} as Record<ChainId, number>,
      ),
    ),

    getChainsName: createSelector((networks) =>
      networks.networks.reduce(
        (acc, backendNetwork) => {
          acc[toChainId(backendNetwork.id)] = backendNetwork.name;
          return acc;
        },
        {} as Record<ChainId, string>,
      ),
    ),

    getChainsBadge: createSelector((networks) =>
      networks.networks.reduce(
        (acc, backendNetwork) => {
          acc[toChainId(backendNetwork.id)] = backendNetwork.icons.badgeURL;
          return acc;
        },
        {} as Record<ChainId, string>,
      ),
    ),

    getChainsIdByName: createSelector((networks) =>
      networks.networks.reduce(
        (acc, backendNetwork) => {
          acc[backendNetwork.name] = toChainId(backendNetwork.id);
          return acc;
        },
        {} as Record<string, ChainId>,
      ),
    ),

    getChainsGasSpeeds: createSelector((networks) => {
      return networks.networks.reduce(
        (acc, backendNetwork): Record<ChainId, GasSpeed[]> => {
          const chainId = toChainId(backendNetwork.id);
          acc[chainId] = getDefaultGasSpeeds(chainId);
          return acc;
        },
        {} as Record<ChainId, GasSpeed[]>,
      );
    }),

    getChainsPollingInterval: createSelector((networks) => {
      return networks.networks.reduce(
        (acc, backendNetwork) => {
          const chainId = toChainId(backendNetwork.id);
          acc[chainId] = getDefaultPollingInterval(chainId);
          return acc;
        },
        {} as Record<ChainId, number>,
      );
    }),

    getChainsSimplehashNetwork: createSelector((networks) =>
      networks.networks.reduce(
        (acc, backendNetwork) => {
          const chainId = toChainId(backendNetwork.id);
          acc[chainId] = getDefaultSimplehashNetwork(chainId);
          return acc;
        },
        {} as Record<ChainId, string>,
      ),
    ),

    filterChainIdsByService: createParameterizedSelector(
      (networks) =>
        (servicePath: (services: BackendNetworkServices) => boolean) =>
          networks.networks
            .filter((network) => servicePath(network.enabledServices))
            .map((network) => toChainId(network.id)),
    ),

    getMeteorologySupportedChainIds: createSelector((networks) =>
      networks.networks
        .filter((network) => network.enabledServices.meteorology.enabled)
        .map((network) => toChainId(network.id)),
    ),

    getSwapSupportedChainIds: createSelector((networks) =>
      networks.networks
        .filter((network) => network.enabledServices.swap.enabled)
        .map((network) => toChainId(network.id)),
    ),

    getApprovalsSupportedChainIds: createSelector((networks) =>
      networks.networks
        .filter((network) => network.enabledServices.addys.approvals)
        .map((network) => toChainId(network.id)),
    ),

    getTransactionsSupportedChainIds: createSelector((networks) =>
      networks.networks
        .filter((network) => network.enabledServices.addys.transactions)
        .map((network) => toChainId(network.id)),
    ),

    getSupportedAssetsChainIds: createSelector((networks) =>
      networks.networks
        .filter((network) => network.enabledServices.addys.assets)
        .map((network) => toChainId(network.id)),
    ),

    getSupportedPositionsChainIds: createSelector((networks) =>
      networks.networks
        .filter((network) => network.enabledServices.addys.positions)
        .map((network) => toChainId(network.id)),
    ),

    getTokenSearchSupportedChainIds: createSelector((networks) =>
      networks.networks
        .filter((network) => network.enabledServices.tokenSearch.enabled)
        .map((network) => toChainId(network.id)),
    ),

    getNftSupportedChainIds: createSelector((networks) =>
      networks.networks
        .filter((network) => network.enabledServices.nftProxy.enabled)
        .map((network) => toChainId(network.id)),
    ),

    getFlashbotsSupportedChainIds: createSelector(() => [ChainId.mainnet]),

    getShouldDefaultToFastGasChainIds: createSelector(() => [
      ChainId.mainnet,
      ChainId.polygon,
      ChainId.goerli,
    ]),

    getChainGasUnits: createParameterizedSelector(
      (networks) => (chainId?: ChainId) => {
        const chainsGasUnits = networks.networks.reduce(
          (acc, backendNetwork: BackendNetwork) => {
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

    getChainDefaultRpc: createParameterizedSelector(() => (chainId) => {
      const defaultChains = get().getDefaultChains();
      return defaultChains[chainId].rpcUrls.default.http[0];
    }),
  }),

  {
    partialize: (state) => ({
      backendChains: state.backendChains,
      backendNetworks: state.backendNetworks,
    }),
    storageKey: 'backendNetworks',
  },
);

/** -----------------------------------------------------------------------------------
 *  Backend networks helper functions.
 *  Some of these defaults, e.g. gas speeds, should eventually come from the backend.
 * ------------------------------------------------------------------------------------*/

function toChainId(id: string): ChainId {
  return parseInt(id, 10);
}

function getDefaultGasSpeeds(chainId: ChainId): GasSpeed[] {
  switch (chainId) {
    case ChainId.bsc:
    case ChainId.goerli:
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

function getDefaultSimplehashNetwork(chainId: ChainId): string {
  switch (chainId) {
    case ChainId.apechain:
      return 'apechain';
    case ChainId.arbitrum:
      return 'arbitrum';
    case ChainId.avalanche:
      return 'avalanche';
    case ChainId.base:
      return 'base';
    case ChainId.blast:
      return 'blast';
    case ChainId.bsc:
      return 'bsc';
    case ChainId.degen:
      return 'degen';
    case ChainId.gnosis:
      return 'gnosis';
    case ChainId.goerli:
      return 'ethereum-goerli';

    // FIXME: Unsupported as of now https://docs.simplehash.com/reference/supported-chains-testnets#mainnets
    // case ChainId.gravity:
    //   return 'gravity';

    // FIXME: Unsupported as of now https://docs.simplehash.com/reference/supported-chains-testnets#mainnets
    // case ChainId.ink:
    //   return 'ink';

    case ChainId.mainnet:
      return 'ethereum';
    case ChainId.optimism:
      return 'optimism';
    case ChainId.polygon:
      return 'polygon';

    // FIXME: Unsupported as of now https://docs.simplehash.com/reference/supported-chains-testnets#mainnets
    // case ChainId.sanko:
    //   return 'sanko';

    case ChainId.scroll:
      return 'scroll';
    case ChainId.zksync:
      return 'zksync-era';
    case ChainId.zora:
      return 'zora';
    case ChainId.linea:
      return 'linea';

    default:
      return '';
  }
}
