import { useQuery } from '@tanstack/react-query';
import { QueryConfig, QueryFunctionArgs, createQueryKey, queryClient } from '~/core/react-query';
import { BackendNetwork } from '~/core/types/chains';
import { BACKEND_NETWORKS_QUERY } from '~/core/state/backendNetworks/sharedQueries';

// ///////////////////////////////////////////////
// Query Types

export interface BackendNetworksResponse {
  networks: BackendNetwork[];
}

// ///////////////////////////////////////////////
// Query Key

/**
 * GraphQL query to fetch backend networks
 * @see scripts/networks.js - for the build time version of this query
 */
export const GRAPHQL_QUERY = BACKEND_NETWORKS_QUERY;

export const backendNetworksQueryKey = () => createQueryKey('backendNetworks', {}, { persisterVersion: 2 });

export type BackendNetworksQueryKey = ReturnType<typeof backendNetworksQueryKey>;

// ///////////////////////////////////////////////
// Query Function

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

export async function backendNetworksQueryFunction({
  queryKey: [_key],
}: QueryFunctionArgs<typeof backendNetworksQueryKey>): Promise<BackendNetworksResponse> {
  return await fetchBackendNetworks();
}

// ///////////////////////////////////////////////
// Query Hook

export function useBackendNetworks<TSelectResult = BackendNetworksResponse>(
  config: QueryConfig<BackendNetworksResponse, Error, TSelectResult, BackendNetworksQueryKey> = {}
) {
    return useQuery({
        queryKey: backendNetworksQueryKey(),
        queryFn: backendNetworksQueryFunction,
        ...config,
        refetchInterval: 60_000,
        staleTime: process.env.IS_TESTING === 'true' ? 0 : 1000,
    });
}

// ///////////////////////////////////////////////
// Prefetch Function

export async function prefetchBackendNetworks() {
    return queryClient.prefetchQuery({
        queryKey: backendNetworksQueryKey(),
        queryFn: backendNetworksQueryFunction,
    })
}
