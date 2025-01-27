import { BackendNetwork } from '~/core/types/chains';
import { transformCustomNetworkToBackendNetwork } from '~/core/state/backendNetworks/utils';

export interface BackendNetworksResponse<B extends boolean = false> {
  networks: BackendNetwork<B>[];
}

export async function fetchNetworks<B extends boolean = false>(
  query: string,
  customNetworks?: B
): Promise<BackendNetworksResponse<B>> {
  const response = await fetch('https://metadata.p.rainbow.me/v1/graph', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { device: 'BX', includeTestnets: true },
    }),
  });

  const { data } = await response.json();

  if (customNetworks) {
    return {
      networks: data.networks.map(transformCustomNetworkToBackendNetwork),
    };
  }

  return data;
}
