import { Chain } from 'viem';
import { mainnet } from 'viem/chains';

import { BackendNetwork } from '../types/chains';

const INTERNAL_BUILD = process.env.INTERNAL_BUILD === 'true';
const IS_DEV = process.env.IS_DEV === 'true';

const proxyBackendNetworkRpcEndpoint = (endpoint: string) => {
  return `${endpoint}${process.env.RPC_PROXY_API_KEY}`;
};

export function transformBackendNetworkToChain(network: BackendNetwork): Chain {
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
