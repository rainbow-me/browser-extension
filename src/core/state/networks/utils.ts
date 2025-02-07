import { AddressZero } from '@ethersproject/constants';
import { type Chain, avalancheFuji, curtis, inkSepolia } from 'viem/chains';

import buildTimeNetworks from 'static/data/networks.json';
import { NetworkState } from '~/core/state/networks/networks';
import { useRainbowChainsStore } from '~/core/state/rainbowChains';
import { useUserChainsStore } from '~/core/state/userChains';
import {
  BackendNetworks,
  ChainId,
  CustomNetwork,
  MergedChain,
  Networks,
  UserPreferences,
} from '~/core/types/chains';
import { GasSpeed } from '~/core/types/gas';
import { transformBackendNetworksToChains } from '~/core/utils/backendNetworks';
import { logger } from '~/logger';

const RPC_PROXY_API_KEY = process.env.RPC_PROXY_API_KEY;

export const DEFAULT_PRIVATE_MEMPOOL_TIMEOUT = 2 * 60 * 1_000;

const proxyBackendNetworkRpcEndpoint = (endpoint: string) => {
  return `${endpoint}${RPC_PROXY_API_KEY}`;
};

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

/**
 * Merges backend network data with user-defined network preferences to create a unified chain configuration
 * @param networks - Backend-provided network configurations
 * @param userOverrides - User-defined network preferences and custom networks
 * @returns A record mapping chain IDs to merged chain configurations that combine backend data with user overrides
 */
export const mergeChainData = (
  networks: Networks,
  userOverrides: Record<number, UserPreferences>,
): Record<number, MergedChain> => {
  const mergedChainData: Record<number, MergedChain> = {};
  const backendNetworks = transformBackendNetworksToChains(
    networks.backendNetworks.networks,
  );

  for (const chain of backendNetworks) {
    const chainId = chain.id;
    const userPrefs = userOverrides[chainId];
    if (userPrefs.type === 'custom') continue;
    mergedChainData[chainId] = {
      ...chain,
      ...userPrefs,
    };
  }

  return mergedChainData;
};

export const mergedChainToViemChain = (mergedChain: MergedChain): Chain => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type, enabled, order, activeRpcUrl, rpcs, ...chain } = mergedChain;
  return chain;
};
const isUserChainOrderMalformed = (userChainsOrder: number[]) => {
  return userChainsOrder.some((id) => id == null || Number.isNaN(id));
};

export const buildInitialUserPreferences = (
  initialSupportedNetworks = buildTimeNetworks,
): Record<number, UserPreferences> => {
  const userOverrides: Record<number, UserPreferences> = {};

  const { rainbowChains } = useRainbowChainsStore.getState();
  const { userChains, userChainsOrder } = useUserChainsStore.getState();

  let order = userChainsOrder;
  if (isUserChainOrderMalformed(order)) {
    const defaultInitialOrder =
      useUserChainsStore.getInitialState().userChainsOrder;
    logger.warn(
      '[buildInitialUserPreferences] User chain order is malformed, using default order',
      {
        userChainsOrder,
        defaultInitialOrder,
      },
    );
    order = defaultInitialOrder;
  }

  const orderWithDuplicatesRemoved = [...new Set(order)];

  for (const chainId of Object.keys(rainbowChains)) {
    const chainIdNum = toChainId(chainId);
    const chain = rainbowChains[chainIdNum];

    if (!userOverrides[chainIdNum]) {
      userOverrides[chainIdNum] = {} as UserPreferences;
    }

    userOverrides[chainIdNum].activeRpcUrl = chain.activeRpcUrl;
    userOverrides[chainIdNum].enabled = userChains[chainIdNum] ?? false;

    const desiredOrder = orderWithDuplicatesRemoved.findIndex(
      (id) => id === chainIdNum,
    );
    userOverrides[chainIdNum].order =
      userOverrides[chainIdNum].order ?? desiredOrder === -1
        ? undefined
        : desiredOrder;

    const rpcs: Record<string, Chain> = {};
    // construct RPCs
    for (const c of chain.chains) {
      const rpcUrl = c.rpcUrls.default.http[0];
      rpcs[rpcUrl] = c;
    }

    userOverrides[chainIdNum].rpcs = rpcs;

    const isSupported = initialSupportedNetworks.backendNetworks.networks.some(
      (n) => +n.id === chainIdNum,
    );
    if (isSupported) {
      userOverrides[chainIdNum].type = 'supported';
    } else {
      // for user-added custom networks, we need chain info attached to the userOverride
      userOverrides[chainIdNum].type = 'custom';
      const activeChain = chain.chains.find(
        (c) => c.rpcUrls.default.http[0] === chain.activeRpcUrl,
      );
      if (activeChain) {
        userOverrides[chainIdNum] = {
          ...userOverrides[chainIdNum],
          ...activeChain,
        };
      }
    }
  }

  return userOverrides;
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
) => {
  const userOverrides = { ...state.userOverrides };

  for (const chainId of diff.keys()) {
    const chainIdNum = toChainId(chainId);
    const incoming = diff.get(chainId);

    if (!incoming || !userOverrides[chainIdNum]) continue;

    const defaultRpcUrl = proxyBackendNetworkRpcEndpoint(
      incoming.defaultRPC.url,
    );

    const previousPrefs = userOverrides[chainIdNum];

    // we want to trim off the chain info from the previously 'custom' network
    userOverrides[chainIdNum] = {
      type: 'supported',
      activeRpcUrl: defaultRpcUrl,
      enabled: true,
      order: previousPrefs.order,
      rpcs: previousPrefs.rpcs,
    };
  }

  return userOverrides;
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

export const LOCAL_NETWORKS: CustomNetwork[] = [
  {
    id: 1337,
    name: 'Hardhat',
    iconURL: '',
    nativeAsset: {
      address: AddressZero,
      decimals: 18,
      symbol: 'ETH',
      iconURL: '',
    },
    defaultRPCURL: 'http://127.0.0.1:8545',
    defaultExplorerURL: '',
    testnet: {
      FaucetURL: '',
      isTestnet: true,
      mainnetChainID: 1,
    },
  },
  {
    id: 1338,
    name: 'Hardhat OP',
    iconURL: '',
    nativeAsset: {
      address: AddressZero,
      decimals: 18,
      symbol: 'ETH',
      iconURL: '',
    },
    defaultRPCURL: 'http://127.0.0.1:8545',
    defaultExplorerURL: '',
    testnet: {
      FaucetURL: '',
      isTestnet: true,
      mainnetChainID: 1,
    },
  },
  {
    id: 1,
    name: 'Mainnet Fork',
    iconURL: '',
    nativeAsset: {
      address: AddressZero,
      decimals: 18,
      symbol: 'ETH',
      iconURL: '',
    },
    defaultRPCURL: 'http://127.0.0.1:8545',
    defaultExplorerURL: '',
    testnet: {
      FaucetURL: '',
      isTestnet: true,
      mainnetChainID: 1,
    },
  },
  {
    id: 31337,
    name: 'Mainnet (Dev)',
    iconURL: '',
    nativeAsset: {
      address: AddressZero,
      decimals: 18,
      symbol: 'ETH',
      iconURL: '',
    },
    defaultRPCURL: 'http://127.0.0.1:8545',
    defaultExplorerURL: '',
    testnet: {
      FaucetURL: '',
      isTestnet: true,
      mainnetChainID: 1,
    },
  },
  {
    id: avalancheFuji.id,
    name: avalancheFuji.name,
    iconURL: '',
    nativeAsset: {
      address: AddressZero,
      decimals: avalancheFuji.nativeCurrency.decimals,
      symbol: avalancheFuji.nativeCurrency.symbol,
      iconURL: '',
    },
    defaultRPCURL: avalancheFuji.rpcUrls.default.http[0],
    defaultExplorerURL: avalancheFuji.blockExplorers.default.name,
    testnet: {
      FaucetURL: '',
      isTestnet: avalancheFuji.testnet,
      mainnetChainID: avalancheFuji.id,
    },
  },
  {
    id: curtis.id,
    name: curtis.name,
    iconURL: '',
    nativeAsset: {
      address: AddressZero,
      decimals: curtis.nativeCurrency.decimals,
      symbol: curtis.nativeCurrency.symbol,
      iconURL: '',
    },
    defaultRPCURL: curtis.rpcUrls.default.http[0],
    defaultExplorerURL: curtis.blockExplorers.default.name,
    testnet: {
      FaucetURL: '',
      isTestnet: curtis.testnet,
      mainnetChainID: curtis.id,
    },
  },
  {
    id: inkSepolia.id,
    name: inkSepolia.name,
    iconURL: '',
    nativeAsset: {
      address: AddressZero,
      decimals: inkSepolia.nativeCurrency.decimals,
      symbol: inkSepolia.nativeCurrency.symbol,
      iconURL: '',
    },
    defaultRPCURL: inkSepolia.rpcUrls.default.http[0],
    defaultExplorerURL: inkSepolia.blockExplorers.default.name,
    testnet: {
      FaucetURL: '',
      isTestnet: inkSepolia.testnet,
      mainnetChainID: inkSepolia.id,
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
