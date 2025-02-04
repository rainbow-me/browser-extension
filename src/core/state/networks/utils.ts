import { type Chain, avalancheFuji, curtis, inkSepolia } from 'viem/chains';

import {
  mergeNewOfficiallySupportedChainsState,
  useFavoritesStore,
} from '~/core/state/favorites';
import { useRainbowChainsStore } from '~/core/state/rainbowChains';
import { useUserChainsStore } from '~/core/state/userChains';
import {
  BackendNetworks,
  ChainId,
  CustomNetwork,
  UserPreferences,
} from '~/core/types/chains';
import { GasSpeed } from '~/core/types/gas';

import { NetworkState } from './networks';

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

export const buildInitialUserPreferences = (): Record<
  number,
  UserPreferences
> => {
  const userOverrides: Record<number, UserPreferences> = {};

  const rainbowChains = useRainbowChainsStore.getState().rainbowChains;
  const { userChains, userChainsOrder } = useUserChainsStore.getState();

  for (const chainId of Object.keys(rainbowChains)) {
    const chainIdNum = toChainId(chainId);
    const chain = rainbowChains[chainIdNum];

    if (!userOverrides[chainIdNum]) {
      userOverrides[chainIdNum] = {} as UserPreferences;
    }

    userOverrides[chainIdNum].activeRpcUrl = chain.activeRpcUrl;
    userOverrides[chainIdNum].enabled = userChains[chainIdNum] ?? false;
    userOverrides[chainIdNum].order = userChainsOrder[chainIdNum];

    const rpcs: Record<string, Chain> = {};
    // construct RPCs
    for (const c of chain.chains) {
      const rpcUrl = c.rpcUrls.default.http[0];
      rpcs[rpcUrl] = c;
    }

    userOverrides[chainIdNum].rpcs = rpcs;
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

    userOverrides[chainIdNum] = {
      ...userOverrides[chainIdNum],
      enabled: true,
      activeRpcUrl: defaultRpcUrl,
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
    case ChainId.polygon:
      return 2_000;
    case ChainId.arbitrum:
    case ChainId.bsc:
      return 3_000;
    default:
      return 5_000;
  }
}

export const syncDefaultFavoritesForNewlySupportedNetworks = (
  newlySupportedNetworks: ChainId[],
) => {
  return mergeNewOfficiallySupportedChainsState(
    useFavoritesStore.getState(),
    newlySupportedNetworks,
  );
};

export const LOCAL_NETWORKS: CustomNetwork[] = [
  {
    id: 1337,
    name: 'Hardhat',
    iconURL: '',
    nativeAsset: {
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
