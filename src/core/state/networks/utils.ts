import { isEmpty } from 'lodash';
import { type Chain, mainnet } from 'viem/chains';

import {
  BackendNetwork,
  BackendNetworks,
  ChainId,
  ChainPreferences,
  Networks,
  TransformedChain,
} from '~/core/types/chains';
import { GasSpeed } from '~/core/types/gas';
import { logger } from '~/logger';

import {
  DEFAULT_PRIVATE_MEMPOOL_TIMEOUT,
  INTERNAL_BUILD,
  IS_DEV,
  IS_TESTING,
  RPC_PROXY_API_KEY,
  buildTimeNetworks,
} from './constants';
import { NetworkState, NetworkUserPreferences } from './types';

// Export the constant for backward compatibility
export { DEFAULT_PRIVATE_MEMPOOL_TIMEOUT };

export function getBadgeUrl({
  chainBadges,
  size,
}: {
  chainBadges: BackendNetwork['icons']['uncropped'] | undefined;
  size: number;
}): string | undefined {
  if (!chainBadges) return undefined;
  return size > 20 ? chainBadges.largeURL : chainBadges.smallURL;
}

const proxyBackendNetworkRpcEndpoint = (endpoint: string) => {
  return `${endpoint}${RPC_PROXY_API_KEY}`;
};

export function transformBackendNetworkToChain(
  network: BackendNetworks['networks'][number],
): Chain {
  if (!network) {
    throw new Error('Invalid network data');
  }
  const defaultRpcUrl = proxyBackendNetworkRpcEndpoint(network.defaultRPC.url);

  return {
    id: parseInt(network.id, 10),
    name: network.label,
    testnet: network.testnet,
    nativeCurrency: {
      name: network.nativeAsset.name,
      symbol: network.nativeAsset.symbol,
      decimals: network.nativeAsset.decimals,
    },
    rpcUrls: {
      default: {
        http: [defaultRpcUrl],
      },
      public: {
        http: [defaultRpcUrl],
      },
    },
    blockExplorers: {
      default: {
        url: network.defaultExplorer.url,
        name: network.defaultExplorer.label,
      },
    },
    contracts:
      parseInt(network.id, 10) === mainnet.id ? mainnet.contracts : undefined,
  };
}

export function transformBackendNetworksToChains(
  networks?: BackendNetworks['networks'],
): Chain[] {
  if (!networks) {
    return [];
  }
  // include all networks for internal builds, otherwise filter out flagged as internal
  return networks
    .filter((network) => !network.internal || INTERNAL_BUILD || IS_DEV)
    .map((network) => transformBackendNetworkToChain(network));
}

export function toChainId(id: string): ChainId {
  return parseInt(id, 10);
}

/**
 * Converts an object to a string hash
 *
 * **IMPORTANT: The delimiter should not appear in any of the object values**
 * @param obj - The object to convert to a hash
 * @param delimiter - The delimiter to use between the object values
 * @returns The hash of the object
 */
const toHash = <T extends object>(obj: T, delimiter = '----'): string =>
  Object.values(obj).join(delimiter);

/**
 * Maps provide O(1) insertion and lookup time.
 * Therefore this can be solved in O(n) (and not O(n²) like most solutions).
 * For that, it is necessary to generate a unique primitive (string / number)
 * key for each object.
 *
 * Using `toHash` we take a delimiter that does not appear in any of the values and compose a string.
 * Then a Map gets created. For difference: when an element exists already in the Map, it gets removed,
 * otherwise it gets added. Therefore only the elements that are included odd times (meaning only once) remain.
 * For union: when an element exists already in the Map, it is kept, otherwise it gets added.
 * This will only work if the elements are unique in each array unlike lodash's `differenceBy`.
 */
export function differenceOrUnionOf<
  T extends object,
  K extends keyof T | undefined = undefined,
>({
  existing,
  incoming,
  valueKey,
  method = 'difference',
}: {
  existing: T[];
  incoming: T[];
  valueKey?: K;
  method?: 'difference' | 'union';
}): Map<string, K extends keyof T ? T[K] : T> {
  const entries = new Map();

  for (const el of [...existing, ...incoming]) {
    const key = toHash(el);
    switch (method) {
      case 'union':
        entries.set(key, valueKey ? el[valueKey] : el);
        break;
      case 'difference':
        if (entries.has(key)) {
          entries.delete(key);
        } else {
          entries.set(key, valueKey ? el[valueKey] : el);
        }
        break;
    }
  }

  return entries as Map<string, K extends keyof T ? T[K] : T>;
}

export const mergedChainToViemChain = (
  mergedChain: TransformedChain,
): Chain => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type, enabled, order, activeRpcUrl, rpcs, ...chain } = mergedChain;
  return chain;
};

const isUserChainOrderMalformed = (userChainsOrder: number[]) => {
  return userChainsOrder.some((id) => id == null || Number.isNaN(id));
};

const buildNewUserPreferences = (
  initialNonInternalNetworks: BackendNetworks['networks'],
  enabledChainIds: Set<number>,
) => {
  const userPreferences: Record<number, ChainPreferences> = {};
  const chainOrder = initialNonInternalNetworks.map(({ id }) => toChainId(id));

  return {
    userPreferences,
    chainOrder,
    enabledChainIds,
  };
};

// This function now takes rainbowChains and userChains as parameters instead of importing them
export const buildInitialUserPreferences = (
  initialSupportedNetworks = buildTimeNetworks,
  rainbowChains: Record<number, { activeRpcUrl: string; chains: Chain[] }> = {},
  userChains: Record<number, boolean> = {},
  userChainsOrder: number[] = [],
): Pick<NetworkState, 'userPreferences' | 'chainOrder' | 'enabledChainIds'> => {
  logger.debug(
    '[buildInitialUserPreferences] Building initial user preferences',
    {
      initialSupportedNetworks,
    },
  );

  const userPreferences: Record<number, ChainPreferences> = {};
  const initialNonInternalNetworks =
    initialSupportedNetworks.backendNetworks.networks.filter(
      (network) => !network.internal || INTERNAL_BUILD || IS_DEV,
    );

  logger.debug('[buildInitialUserPreferences] Filtered non-internal networks', {
    initialNonInternalNetworks,
  });

  const enabledChainIds = new Set<number>(
    initialNonInternalNetworks.map(({ id }) => toChainId(id)),
  );

  logger.debug('[buildInitialUserPreferences] Current store state', {
    rainbowChains,
    userChains,
    userChainsOrder,
  });

  if (isEmpty(rainbowChains) || isEmpty(userChains)) {
    logger.debug(
      '[buildInitialUserPreferences] No existing chains found, building new preferences',
    );
    return buildNewUserPreferences(initialNonInternalNetworks, enabledChainIds);
  }

  let order = userChainsOrder;
  if (isUserChainOrderMalformed(order)) {
    const defaultInitialOrder = initialNonInternalNetworks.map(({ id }) =>
      toChainId(id),
    );

    logger.warn(
      '[buildInitialUserPreferences] User chain order is malformed, using default order',
      {
        userChainsOrder,
        defaultInitialOrder,
      },
    );
    order = defaultInitialOrder;
  }

  const chainOrder = new Set<number>(order);
  for (const supportedNetwork of initialNonInternalNetworks) {
    const chainIdNum = toChainId(supportedNetwork.id);
    if (!chainOrder.has(chainIdNum)) {
      chainOrder.add(chainIdNum);
    }
  }

  logger.debug('[buildInitialUserPreferences] Processing rainbow chains', {
    chainIds: Object.keys(rainbowChains),
  });

  for (const chainId of Object.keys(rainbowChains)) {
    const chainIdNum = toChainId(chainId);
    const chain = rainbowChains[chainIdNum];

    logger.debug('[buildInitialUserPreferences] Processing chain', {
      chainId: chainIdNum,
      chain,
    });

    if (!userPreferences[chainIdNum]) {
      userPreferences[chainIdNum] = {} as ChainPreferences;
    }

    if (!chainOrder.has(chainIdNum)) {
      chainOrder.add(chainIdNum);
    }

    userPreferences[chainIdNum].activeRpcUrl = chain.activeRpcUrl;
    if (userChains[chainIdNum] && !enabledChainIds.has(chainIdNum)) {
      enabledChainIds.add(chainIdNum);
    } else if (!userChains[chainIdNum] && enabledChainIds.has(chainIdNum)) {
      enabledChainIds.delete(chainIdNum);
    }

    const rpcs: Record<string, Chain> = {};
    // construct RPCs
    for (const c of chain.chains) {
      const rpcUrl = c.rpcUrls.default.http[0];
      rpcs[rpcUrl] = c;
    }

    userPreferences[chainIdNum].rpcs = rpcs;

    const isSupported = initialNonInternalNetworks.some(
      (n) => +n.id === chainIdNum,
    );
    if (isSupported) {
      userPreferences[chainIdNum].type = 'supported';
    } else {
      // for user-added custom networks, we need chain info attached to the userOverride
      userPreferences[chainIdNum].type = 'custom';
      const activeChain = chain.chains.find(
        (c) => c.rpcUrls.default.http[0] === chain.activeRpcUrl,
      );
      if (activeChain) {
        userPreferences[chainIdNum] = {
          ...userPreferences[chainIdNum],
          ...activeChain,
        };
      }
    }
  }

  logger.debug('[buildInitialUserPreferences] Final preferences built', {
    userPreferences,
    chainOrder: Array.from(chainOrder),
    enabledChainIds: Array.from(enabledChainIds),
  });

  return {
    userPreferences,
    chainOrder: Array.from(chainOrder),
    enabledChainIds,
  };
};

/**
 * Updates user preferences for newly supported backend-driven networks.
 * For each new network, it enables the network and sets its active RPC URL
 * to the backend's default RPC endpoint.
 *
 * @param state - Current network state containing user overrides
 * @param diff - Map of new networks keyed by chain ID, containing network config from backend
 * @returns Updated user overrides with enabled networks and default RPC URLs
 */
export const modifyUserPreferencesForNewlySupportedNetworks = (
  state: NetworkState,
  diff: Map<string, BackendNetworks['networks'][number]>,
): Pick<NetworkState, 'userPreferences' | 'enabledChainIds' | 'chainOrder'> => {
  const userPreferences = { ...state.userPreferences };
  const enabledChainIds = new Set<number>(state.enabledChainIds);
  const chainOrder = [...new Set(state.chainOrder)];

  for (const chainId of diff.keys()) {
    const chainIdNum = toChainId(chainId);
    const incoming = diff.get(chainId);

    if (!incoming) continue;

    const defaultRpcUrl = proxyBackendNetworkRpcEndpoint(
      incoming.defaultRPC.url,
    );

    const previousPrefs = userPreferences[chainIdNum];
    const chain = transformBackendNetworkToChain(incoming);
    userPreferences[chainIdNum] = {
      type: 'supported',
      activeRpcUrl: defaultRpcUrl,
      rpcs: {
        ...(previousPrefs?.rpcs || {}),
        [defaultRpcUrl]: chain,
      },
    };
    enabledChainIds.add(chainIdNum);
    chainOrder.push(chainIdNum);
  }

  return {
    userPreferences,
    enabledChainIds,
    chainOrder,
  };
};

/** -----------------------------------------------------------------------------------
 *  Backend networks helper functions.
 *  Some of these defaults, e.g. gas speeds, should eventually come from the backend.
 * ------------------------------------------------------------------------------------*/

export function getDefaultGasSpeeds(chainId: ChainId): GasSpeed[] {
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

export function getDefaultPollingInterval(chainId: ChainId): number {
  switch (chainId) {
    case ChainId.arbitrum:
    case ChainId.mainnet:
    case ChainId.hardhat:
      return 5000;
    case ChainId.base:
    case ChainId.bsc:
    case ChainId.optimism:
    case ChainId.polygon:
    case ChainId.zora:
    case ChainId.avalanche:
    case ChainId.hardhatOptimism:
    default:
      return 2000;
  }
}

export const LOCAL_TESTNETS: Chain[] = [
  {
    id: 1337,
    name: 'Hardhat',
    testnet: true,
    nativeCurrency: {
      name: 'Hardhat ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['http://127.0.0.1:8545'],
      },
    },
  },
  {
    id: 1338,
    name: 'Hardhat OP',
    testnet: true,
    nativeCurrency: {
      name: 'Hardhat OP',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['http://127.0.0.1:8545'],
      },
    },
  },
];

export const oldDefaultRPC: { [key in ChainId]?: string } = {
  [ChainId.mainnet]: process.env.ETH_MAINNET_RPC,
  [ChainId.optimism]: process.env.OPTIMISM_MAINNET_RPC,
  [ChainId.arbitrum]: process.env.ARBITRUM_MAINNET_RPC,
  [ChainId.polygon]: process.env.POLYGON_MAINNET_RPC,
  [ChainId.base]: process.env.BASE_MAINNET_RPC,
  [ChainId.zora]: process.env.ZORA_MAINNET_RPC,
  [ChainId.bsc]: process.env.BSC_MAINNET_RPC,
  [ChainId.sepolia]: process.env.ETH_SEPOLIA_RPC,
  [ChainId.holesky]: process.env.ETH_HOLESKY_RPC,
  [ChainId.optimismSepolia]: process.env.OPTIMISM_SEPOLIA_RPC,
  [ChainId.bscTestnet]: process.env.BSC_TESTNET_RPC,
  [ChainId.arbitrumSepolia]: process.env.ARBITRUM_SEPOLIA_RPC,
  [ChainId.baseSepolia]: process.env.BASE_SEPOLIA_RPC,
  [ChainId.zoraSepolia]: process.env.ZORA_SEPOLIA_RPC,
  [ChainId.avalanche]: process.env.AVALANCHE_MAINNET_RPC,
  [ChainId.avalancheFuji]: process.env.AVALANCHE_FUJI_RPC,
  [ChainId.blast]: process.env.BLAST_MAINNET_RPC,
  [ChainId.blastSepolia]: process.env.BLAST_SEPOLIA_RPC,
  [ChainId.polygonAmoy]: process.env.POLYGON_AMOY_RPC,
  [ChainId.degen]: process.env.DEGEN_MAINNET_RPC,
};

/**
 * Merges backend network data with user-defined network preferences to create a unified chain configuration
 * @param networks - Backend-provided network configurations
 * @param userPreferences - User-defined network preferences and custom networks
 * @returns A record mapping chain IDs to merged chain configurations that combine backend data with user overrides
 */
export const mergeChainData = (
  networks: Networks,
  userPreferences: NetworkUserPreferences,
  chainOrder: Array<number>,
  enabledChainIds: Set<number>,
): Record<number, TransformedChain> => {
  const mergedChainData: Record<number, TransformedChain> = {};
  const backendNetworks = transformBackendNetworksToChains(
    networks.backendNetworks.networks,
  );

  const allNetworks = IS_TESTING
    ? [...LOCAL_TESTNETS, ...backendNetworks]
    : [...backendNetworks];

  for (const chain of allNetworks) {
    const chainId = chain.id;
    const userPrefs = userPreferences[chainId];
    const order = chainOrder.indexOf(chainId);

    // case where we have backend networks with no user preferences on top
    if (!userPrefs) {
      mergedChainData[chainId] = {
        ...chain,
        rpcs: {
          [chain.rpcUrls.default.http[0]]: chain,
        },
        enabled: enabledChainIds.has(chainId),
        type: 'supported',
        order: order === -1 ? undefined : order,
        activeRpcUrl: chain.rpcUrls.default.http[0],
      };
      continue;
    }

    // case where we have user preferences on top of backend networks
    mergedChainData[chainId] = {
      ...chain,
      rpcs: {
        ...userPrefs.rpcs,
        [chain.rpcUrls.default.http[0]]: chain,
      },
      activeRpcUrl: userPrefs.activeRpcUrl,
      type: 'supported',
      order: order === -1 ? undefined : order,
      enabled: enabledChainIds.has(chainId),
    };
  }

  // case where we ONLY have user preferences (aka custom user-added chains)
  for (const chainId of Object.keys(userPreferences)) {
    const chainIdNum = toChainId(chainId);
    const userPrefs = userPreferences[chainIdNum];
    if (!userPrefs) continue;
    if (userPrefs.type === 'supported') continue;
    const order = chainOrder.indexOf(chainIdNum);
    mergedChainData[chainIdNum] = {
      ...userPrefs,
      type: 'custom',
      order: order === -1 ? undefined : order,
      enabled: enabledChainIds.has(chainIdNum),
    };
  }

  return mergedChainData;
};
