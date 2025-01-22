import { BACKEND_NETWORKS_QUERY } from '~/core/resources/backendNetworks/sharedQueries';
import { BackendNetwork } from '~/core/types/chains';

export interface BackendNetworksResponse {
  networks: BackendNetwork[];
}

export async function fetchBackendNetworks(): Promise<BackendNetworksResponse> {
  const response = await fetch('https://metadata.p.rainbow.me/v1/graph', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: BACKEND_NETWORKS_QUERY,
      variables: { device: 'BX', includeTestnets: true },
    }),
  });

  const { data } = await response.json();

  return data as BackendNetworksResponse;
}
