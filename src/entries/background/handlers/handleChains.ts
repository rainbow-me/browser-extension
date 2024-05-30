import { Chain } from 'viem';

import { GetNetworksQuery } from '~/core/graphql/__generated__/metadataStaging';
import { fetchBackendChains } from '~/core/resources/chains/backendChains';

type Network = NonNullable<GetNetworksQuery['networks']>[number];

function transformNetworkToChain(network: Network): Chain {
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
        http: [network.defaultRPC.url],
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

function transformGetNetworksQueryToChains(
  queryResult?: GetNetworksQuery | null,
): Chain[] {
  if (!queryResult?.networks) {
    return [];
  }
  return queryResult.networks.map((network) =>
    transformNetworkToChain(network),
  );
}

export async function handleChains() {
  const backendChains = await fetchBackendChains({ hash: '123' });
  const chains = transformGetNetworksQueryToChains(backendChains);
  console.log('-- chains', chains);
}
