/**
 * React Query adapter for TokenSearch. Delegates to tokenSearchService.
 * Service owns cache + HTTP; this layer adds RQ subscription, dedup, loading states.
 */
import { useQuery } from '@tanstack/react-query';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { useNetworkStore } from '~/core/state/networks/networks';
import { SearchAsset } from '~/core/types/search';

import {
  type TokenSearchArgs,
  searchTokenSearch,
  searchTokenSearchAllNetworks,
} from './tokenSearchService';

// ///////////////////////////////////////////////
// Query Key

export const tokenSearchQueryKey = (args: TokenSearchArgs) =>
  createQueryKey('TokenSearch', args, { persisterVersion: 2 });

/** Used by queryClient to exclude TokenSearch from main RQ persist (1–3.5 MB each). */
export function isTokenSearchQueryKey(queryKey: readonly unknown[]): boolean {
  return (
    queryKey[1] === 'TokenSearch' || queryKey[0] === 'TokenSearchAllNetworks'
  );
}

type TokenSearchQueryKey = ReturnType<typeof tokenSearchQueryKey>;

// ///////////////////////////////////////////////
// Query Function

export async function tokenSearchQueryFunction({
  queryKey: [args],
}: QueryFunctionArgs<typeof tokenSearchQueryKey>): Promise<SearchAsset[]> {
  return searchTokenSearch(args);
}

type TokenSearchResult = QueryFunctionResult<typeof tokenSearchQueryFunction>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchTokenSearch(
  args: TokenSearchArgs,
  config: QueryConfig<
    TokenSearchResult,
    Error,
    TokenSearchResult,
    TokenSearchQueryKey
  > = {},
) {
  return queryClient.fetchQuery({
    queryKey: tokenSearchQueryKey(args),
    queryFn: tokenSearchQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Hook

export function useTokenSearch(
  args: TokenSearchArgs,
  config: QueryConfig<
    TokenSearchResult,
    Error,
    TokenSearchResult,
    TokenSearchQueryKey
  > = {},
) {
  return useQuery({
    queryKey: tokenSearchQueryKey(args),
    queryFn: tokenSearchQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// All Networks

const tokenSearchAllNetworksQueryKey = ({
  list,
  query,
}: Omit<TokenSearchArgs, 'chainId' | 'fromChainId'>) =>
  ['TokenSearchAllNetworks', { list, query }] as const;

type TokenSearchAllNetworksQueryKey = readonly [
  ...ReturnType<typeof tokenSearchAllNetworksQueryKey>,
  number[],
];

export function useTokenSearchAllNetworks(
  args: Omit<TokenSearchArgs, 'chainId' | 'fromChainId'>,
  config: Omit<
    QueryConfig<
      SearchAsset[],
      Error,
      SearchAsset[],
      TokenSearchAllNetworksQueryKey
    >,
    'queryKey' | 'queryFn'
  > = {},
) {
  const chainIds = useNetworkStore((state) =>
    state.getBackendSupportedChainIds(),
  );

  const { data, isFetching } = useQuery<
    SearchAsset[],
    Error,
    SearchAsset[],
    TokenSearchAllNetworksQueryKey
  >({
    queryKey: [...tokenSearchAllNetworksQueryKey(args), chainIds],
    queryFn: () => searchTokenSearchAllNetworks(args, chainIds),
    refetchOnWindowFocus: false,
    ...config,
  });

  return {
    data: data ?? [],
    isFetching,
  };
}
