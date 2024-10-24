import { Chain } from 'viem';
import { mainnet } from 'viem/chains';

import { BackendCustomNetwork, BackendNetwork } from '../types/chains';

const INTERNAL_BUILD = process.env.INTERNAL_BUILD === 'true';
const IS_DEV = process.env.IS_DEV === 'true';

const proxyBackendNetworkRpcEndpoint = (endpoint: string) => {
  return `${endpoint}${process.env.RPC_PROXY_API_KEY}`;
};

function transformBackendNetworkToChain(network: BackendNetwork): Chain {
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
  networks?: BackendNetwork[],
): Chain[] {
  if (!networks) {
    return [];
  }
  // include all networks for internal builds, otherwise filter out flagged as internal
  return networks
    .filter((network) => !network.internal || INTERNAL_BUILD || IS_DEV)
    .map((network) => transformBackendNetworkToChain(network));
}

function transformBackendCustomNetworkToChain(
  network: BackendCustomNetwork,
): Chain {
  if (!network) {
    throw new Error('Invalid network data');
  }

  return {
    id: network.id,
    name: network.name,
    testnet: network.testnet.isTestnet,
    nativeCurrency: {
      name: network.nativeAsset.symbol, // no label from backend
      symbol: network.nativeAsset.symbol,
      decimals: network.nativeAsset.decimals,
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
        name: 'Explorer', // no label from backend
      },
    },
    contracts: network.id === mainnet.id ? mainnet.contracts : undefined,
  };
}

export function transformBackendCustomNetworksToChains(
  networks?: BackendCustomNetwork[],
): Chain[] {
  if (!networks) {
    return [];
  }
  return networks.map((network) =>
    transformBackendCustomNetworkToChain(network),
  );
}
