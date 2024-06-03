import { Chain } from 'viem';

import { proxyBackendNetworkRpcEndpoint } from '../providers';
import { BackendNetwork } from '../types/chains';

export function transformBackendNetworkToChain(network: BackendNetwork): Chain {
  if (!network) {
    throw new Error('Invalid network data');
  }

  return {
    id: parseInt(network.id, 10),
    name: network.name,
    testnet: network.testnet,
    nativeCurrency: {
      name: network.nativeAsset.name,
      symbol: network.nativeAsset.symbol,
      decimals: network.nativeAsset.decimals,
    },
    rpcUrls: {
      default: {
        http: [proxyBackendNetworkRpcEndpoint(network.defaultRPC.url)],
      },
    },
    blockExplorers: {
      default: {
        url: network.defaultExplorer.url,
        name: network.defaultExplorer.label,
      },
    },
  };
}

export function transformBackendNetworksToChains(
  networks?: BackendNetwork[],
): Chain[] {
  if (!networks) {
    return [];
  }
  return networks.map((network) => transformBackendNetworkToChain(network));
}
