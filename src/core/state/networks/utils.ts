import { mainnet } from 'viem/chains';

import { BackendNetworks, CustomNetworks, CustomRPC, Networks } from '~/core/types/chains';
import { ChainId } from '~/core/types/chains';
import { ExtendedChain } from '~/core/types/chains';
import { getDappHostname } from '~/core/utils/connectedApps';

const IS_DEV = process.env.IS_DEV === 'true';
const RPC_PROXY_API_KEY = process.env.RPC_PROXY_API_KEY;
const INTERNAL_BUILD = process.env.INTERNAL_BUILD === 'true';

// TODO: Uncomment this once we have the `privateMempoolTimeout` field on the schema
// const DEFAULT_PRIVATE_MEMPOOL_TIMEOUT = 2 * 60 * 1_000;

const proxyBackendNetworkRpcEndpoint = (endpoint: string) => {
  return `${endpoint}${RPC_PROXY_API_KEY}`;
};

export function transformBackendNetworkToExtendedChain({
  network,
  chains,
}: {
  network: BackendNetworks['networks'][number],
  chains?: ExtendedChain[],
}): ExtendedChain {
  if (!network) {
    throw new Error('Invalid network data');
  }
  const defaultRpcUrl = proxyBackendNetworkRpcEndpoint(network.defaultRPC.url);
  const existingChain = chains?.find((chain) => chain.id === toChainId(network.id));
  const mergedFavorites = new Set([...existingChain?.metadata.favorites || [], ...network.favorites || []]);

  return {
    id: toChainId(network.id),
    name: network.name ?? '',
    label: network.label ?? '',
    testnet: network.testnet,
    nativeCurrency: {
      name: network.nativeAsset.name ?? '',
      symbol: network.nativeAsset.symbol ?? '',
      decimals: network.nativeAsset.decimals ?? 18,
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
        name: network.defaultExplorer.label ?? '',
      },
    },
    contracts:
      parseInt(network.id, 10) === mainnet.id ? mainnet.contracts : undefined,
    metadata: {
      isBackendDriven: true,
      isCustom: false,
      enabled: true,
      order: existingChain?.metadata.order || undefined,
      badgeUrl: network.icons.badgeURL,
      opStack: network.opStack,
      internal: network.internal,
      defaultExplorer: network.defaultExplorer,
      defaultRPC: defaultRpcUrl,
      customRPCs: existingChain?.metadata.customRPCs || [],
      assets: existingChain?.metadata.assets || [],
      faucetUrl: existingChain?.metadata.faucetUrl || undefined,
      gasUnits: network.gasUnits,
      nativeAsset: network.nativeAsset,
      nativeWrappedAsset: network.nativeWrappedAsset,
      // TODO: This doesn't exist on the schema?
      // privateMempoolTimeout: network.privateMempoolTimeout || DEFAULT_PRIVATE_MEMPOOL_TIMEOUT,
      enabledServices: network.enabledServices,
      favorites: Array.from(mergedFavorites),
    },
  };
}

export function transformBackendNetworksToExtendedChains(
  networks?: BackendNetworks,
  chains?: ExtendedChain[]
): ExtendedChain[] {
  if (!networks?.networks) {
    return [];
  }
  // include all networks for internal builds, otherwise filter out flagged as internal
  return networks
    .networks
    .filter((network) => !network.internal || INTERNAL_BUILD || IS_DEV)
    .map((network) => transformBackendNetworkToExtendedChain({
      network,
      chains,
    }));
}

export function transformCustomNetworkToExtendedChain({
  network,
  chains,
}: {
  network: CustomNetworks['customNetworks'][number],
  chains?: ExtendedChain[],
}): ExtendedChain {
  if (!network) {
    throw new Error('Invalid network data');
  }
  const existingChain = chains?.find((chain) => chain.id === network.id);

  const customRPCs = new Set<CustomRPC>(existingChain?.metadata.customRPCs || []);
  customRPCs.add({
    blockExplorerUrl: network.defaultExplorerURL,
    name: getDappHostname(network.defaultExplorerURL),
    rpcUrl: network.defaultRPCURL,
    symbol: network.nativeAsset.symbol,
    testnet: network.testnet.isTestnet,
  });

  return {
    id: network.id,
    name: network.name,
    label: network.name,
    testnet: network.testnet.isTestnet,
    nativeCurrency: {
      name: '',
      symbol: network.nativeAsset.symbol ?? '',
      decimals: network.nativeAsset.decimals ?? 18,
    },
    rpcUrls: {
      default: {
        http: [network.defaultRPCURL],
      },
      public: {
        http: [network.defaultRPCURL],
      },
    },
    blockExplorers: {
      default: {
        url: network.defaultExplorerURL,
        name: getDappHostname(network.defaultExplorerURL),
      },
    },
    contracts: network.id === mainnet.id ? mainnet.contracts : undefined,
    metadata: {
      isBackendDriven: true,
      isCustom: true,
      enabled: existingChain?.metadata.enabled || false,
      order: existingChain?.metadata.order || undefined,
      badgeUrl: network.nativeAsset.iconURL,
      opStack: undefined, // TODO: Do we need this info on custom networks schema?
      internal: false,
      defaultExplorer: {
        url: network.defaultExplorerURL,
        label: getDappHostname(network.defaultExplorerURL),
        transactionURL: '',
        tokenURL: '',
      },
      defaultRPC: network.defaultRPCURL,
      customRPCs: Array.from(customRPCs),
      nativeAsset: { // TODO: Can we get these missing values from a rq cache or something?
        address: '',
        name: '',
        symbol: network.nativeAsset.symbol ?? '',
        decimals: network.nativeAsset.decimals ?? 18,
        iconURL: network.nativeAsset.iconURL ?? '',
        colors: {
          primary: '',
          fallback: '',
          shadow: '',
        },
      },
      // TODO: This doesn't exist on the schema?
      // privateMempoolTimeout: network.privateMempoolTimeout || DEFAULT_PRIVATE_MEMPOOL_TIMEOUT,
    },
  }
}

export const transformCustomNetworkToExtendedChains = (networks: CustomNetworks, chains?: ExtendedChain[]): ExtendedChain[] => {
  if (!networks.customNetworks) {
    return [];
  }
  return networks.customNetworks.map((network) => {
    return transformCustomNetworkToExtendedChain({
      network,
      chains,
    });
  });
}

export const transformNetworksToExtendedChains = (networks: Networks, chains?: ExtendedChain[]): ExtendedChain[] => {
  const backendChains = transformBackendNetworksToExtendedChains(networks.backendNetworks, chains);
  const customChains = transformCustomNetworkToExtendedChains(networks.customNetworks, chains);
  return [...backendChains, ...customChains];
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
const toHash = <T extends object>(obj: T, delimiter = '----'): string => Object.values(obj).join(delimiter);

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
 * @param existing - The existing array of objects
 * @param incoming - The incoming array of objects
 * @param method - Whether to find the difference or union of the arrays
 * @returns The difference or union of the arrays
 */
export function differenceOrUnionOf<T extends object>({
  existing,
  incoming,
  valueKey,
  method = 'difference',
}: {
  existing: T[],
  incoming: T[],
  valueKey: keyof T,
  method?: 'difference' | 'union',
}): Map<string, T[keyof T]> {
  const entries = new Map();

  for(const el of [...existing, ...incoming]) {
    const key = toHash(el);
    switch (method) {
      case 'union':
        entries.set(key, el[valueKey]);
        break;
      case 'difference':
        if(entries.has(key)) {
          entries.delete(key);
        } else {
          entries.set(key, el[valueKey]);
        }
        break;
    }
  }
  
  return entries;
}

export function mergePrimitive<T>(existing: T, incoming: T | undefined): T {
  if (incoming === undefined) {
    return existing;
  }
  return incoming;
}

export function mergeArrays<T>(
  existing: T[] | undefined,
  incoming: T[] | undefined,
  key?: keyof T
): T[] {
  if (!existing && !incoming) return [];
  if (!existing) return incoming || [];
  if (!incoming) return existing;

  // For primitive arrays, merge unique values
  if (typeof existing[0] !== 'object' || key === undefined) {
    const uniqueSet = new Set([...existing, ...incoming]);
    return Array.from(uniqueSet);
  }

  // For object arrays, merge by key
  const [longer, shorter] = existing.length > incoming.length 
    ? [existing, incoming] 
    : [incoming, existing];

  const mergedMap = new Map(
    longer.map(item => [item[key], item])
  );

  for (const item of shorter) {
    const existingItem = mergedMap.get(item[key]);
    if (existingItem) {
      mergedMap.set(item[key], { ...existingItem, ...item });
    } else {
      mergedMap.set(item[key], item);
    }
  }

  return Array.from(mergedMap.values());
}