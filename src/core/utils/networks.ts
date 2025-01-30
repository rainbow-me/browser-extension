import { mainnet } from 'viem/chains';

import { ChainId } from '~/core/types/chains';

import { BackendNetworks, CustomNetworks, Networks, ExtendedChain } from '~/core/types/chains';

const IS_DEV = process.env.IS_DEV === 'true';
const RPC_PROXY_API_KEY = process.env.RPC_PROXY_API_KEY;
const INTERNAL_BUILD = process.env.INTERNAL_BUILD === 'true';

// TODO: Uncomment this once we have the `privateMempoolTimeout` field on the schema
export const DEFAULT_PRIVATE_MEMPOOL_TIMEOUT = 2 * 60 * 1_000;

const proxyBackendNetworkRpcEndpoint = (endpoint: string) => {
  return `${endpoint}${RPC_PROXY_API_KEY}`;
};

export function transformBackendNetworkToExtendedChain({
  network,
  index,
  chains,
}: {
  network: BackendNetworks['networks'][number],
  index: number,
  chains?: ExtendedChain[],
}): ExtendedChain {
  if (!network) {
    throw new Error('Invalid network data');
  }
  const defaultRpcUrl = proxyBackendNetworkRpcEndpoint(network.defaultRPC.url);

  return {
    id: parseInt(network.id, 10),
    name: network.label ?? '',
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
      order: index,
      badgeUrl: network.icons.badgeURL,
      opStack: network.opStack,
      internal: network.internal,
      defaultExplorer: network.defaultExplorer,
      defaultRPC: network.defaultRPC.url,
      gasUnits: network.gasUnits,
      nativeAsset: network.nativeAsset,
      nativeWrappedAsset: network.nativeWrappedAsset,
      // TODO: This doesn't exist on the schema?
      // privateMempoolTimeout: network.privateMempoolTimeout || DEFAULT_PRIVATE_MEMPOOL_TIMEOUT,
      enabledServices: network.enabledServices,
      favorites: network.favorites,
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
    .map((network, index) => transformBackendNetworkToExtendedChain({
      network,
      index,
      chains,
    }));
}

export function transformCustomNetworkToExtendedChain({
  network,
  index,
  chains,
}: {
  network: CustomNetworks['customNetworks'][number],
  index: number,
  chains?: ExtendedChain[],
}): ExtendedChain {
  if (!network) {
    throw new Error('Invalid network data');
  }
  const defaultRpcUrl = proxyBackendNetworkRpcEndpoint(network.defaultRPCURL);
  const existingChain = chains?.find((chain) => chain.id === network.id);

  // TODO: If the chain already exists, we need to merge the new network with the existing one
  if (existingChain) {
    return { ...existingChain };
  }

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
        http: [defaultRpcUrl],
      },
      public: {
        http: [defaultRpcUrl],
      },
    },
    blockExplorers: {
      default: {
        url: network.defaultExplorerURL,
        name: 'Explorer URL'
      },
    },
    contracts: network.id === mainnet.id ? mainnet.contracts : undefined,
    metadata: {
      isBackendDriven: true,
      isCustom: true,
      enabled: false,
      order: index,
      badgeUrl: network.nativeAsset.iconURL,
      opStack: undefined, // TODO: Need this info on custom networks schema
      internal: false,
      defaultExplorer: {
        url: network.defaultExplorerURL,
        label: 'Explorer URL',
        transactionURL: '',
        tokenURL: '',
      },
      defaultRPC: defaultRpcUrl,
      nativeAsset: {
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
  return networks.customNetworks.map((network, index) => {
    return transformCustomNetworkToExtendedChain({
      network,
      index,
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
