import { useQueries, useQuery } from '@tanstack/react-query';
import qs from 'qs';

import { tokenSearchHttp } from '~/core/network/tokenSearch';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';
import {
  SearchAsset,
  TokenSearchListId,
} from '~/core/types/search';

import { parseTokenSearch } from './parseTokenSearch';

// ///////////////////////////////////////////////
// Query Types

type TokenSearchArgs = {
  chainId: ChainId;
  fromChainId?: ChainId | '';
  list: TokenSearchListId;
  query: string;
};

// ///////////////////////////////////////////////
// Query Key

export const tokenSearchQueryKey = ({
  chainId,
  fromChainId,
  list,
  query,
}: TokenSearchArgs) =>
  createQueryKey(
    'TokenSearch',
    { chainId, fromChainId, list, query },
    { persisterVersion: 2 },
  );

type TokenSearchQueryKey = ReturnType<typeof tokenSearchQueryKey>;

// ///////////////////////////////////////////////
// Query Function

export async function tokenSearchQueryFunction({
  queryKey: [{ chainId, fromChainId, list, query }],
}: QueryFunctionArgs<typeof tokenSearchQueryKey>) {
  const queryParams: {
    list: TokenSearchListId;
    query?: string;
    fromChainId?: number;
  } = {
    list,
    query,
  };
  if (fromChainId) {
    queryParams.fromChainId = fromChainId;
  }
  const url = `/${chainId}/?${qs.stringify(queryParams)}`;
  try {
    const tokenSearch = await tokenSearchHttp.get<{ data: SearchAsset[] }>(url);
    return tokenSearch.data.data.map((asset) =>
      parseTokenSearch(asset, chainId),
    );
  } catch (e) {
    return [];
  }
}

type TokenSearchResult = QueryFunctionResult<typeof tokenSearchQueryFunction>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchTokenSearch(
  { chainId, fromChainId, list, query }: TokenSearchArgs,
  config: QueryConfig<
    TokenSearchResult,
    Error,
    TokenSearchResult,
    TokenSearchQueryKey
  > = {},
) {
  return await queryClient.fetchQuery({
    queryKey: tokenSearchQueryKey({
      chainId,
      fromChainId,
      list,
      query,
    }),
    queryFn: tokenSearchQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Hook

export function useTokenSearch(
  { chainId, fromChainId, list, query }: TokenSearchArgs,
  config: QueryConfig<
    TokenSearchResult,
    Error,
    TokenSearchResult,
    TokenSearchQueryKey
  > = {},
) {
  return useQuery({
    queryKey: tokenSearchQueryKey({
      chainId,
      fromChainId,
      list,
      query,
    }),
    queryFn: tokenSearchQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Hook

export function useTokenSearchAllNetworks(
  { list, query }: Omit<TokenSearchArgs, 'chainId' | 'fromChainId'>,
  config: QueryConfig<
    TokenSearchResult,
    Error,
    TokenSearchResult,
    TokenSearchQueryKey
  > = {},
) {
  const backendSupportedChains = useNetworkStore((state) =>
    state.getBackendSupportedChainIds(),
  );

  const queries = useQueries({
    queries: backendSupportedChains.map((chainId) => {
      return {
        queryKey: tokenSearchQueryKey({ chainId, list, query }),
        queryFn: tokenSearchQueryFunction,
        refetchOnWindowFocus: false,
        ...config,
      };
    }),
  });

  return {
    data: queries.map(({ data: assets }) => assets || []).flat(),
    isFetching: queries.some(({ isFetching }) => isFetching),
  };
}
