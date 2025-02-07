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
import { ChainId } from '~/core/types/chains';
import {
  SearchAsset,
  TokenSearchAssetKey,
  TokenSearchListId,
  TokenSearchThreshold,
} from '~/core/types/search';
import { getSupportedChains, isCustomChain } from '~/core/utils/chains';

import { parseTokenSearch } from './parseTokenSearch';

// ///////////////////////////////////////////////
// Query Types

export type TokenSearchArgs = {
  chainId: ChainId;
  fromChainId?: ChainId | '';
  list: TokenSearchListId;
  query: string;
};

export type TokenSearchAllNetworksArgs = {
  keys: TokenSearchAssetKey[];
  list: TokenSearchListId;
  threshold: TokenSearchThreshold;
  query: string;
};

// ///////////////////////////////////////////////
// Query Key

const tokenSearchQueryKey = ({
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

async function tokenSearchQueryFunction({
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
    return parseTokenSearch(tokenSearch.data.data, chainId);
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
  const rainbowSupportedChains = getSupportedChains({
    testnets: false,
  }).filter(({ id }) => !isCustomChain(id));

  const queries = useQueries({
    queries: rainbowSupportedChains.map(({ id: chainId }) => {
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