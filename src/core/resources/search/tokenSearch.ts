import { isAddress } from '@ethersproject/address';
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
  keys: TokenSearchAssetKey[];
  list: TokenSearchListId;
  threshold: TokenSearchThreshold;
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
  keys,
  list,
  threshold,
  query,
}: TokenSearchArgs) =>
  createQueryKey(
    'TokenSearch',
    { chainId, fromChainId, keys, list, threshold, query },
    { persisterVersion: 2 },
  );

type TokenSearchQueryKey = ReturnType<typeof tokenSearchQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function tokenSearchQueryFunction({
  queryKey: [{ chainId, fromChainId, keys, list, threshold, query }],
}: QueryFunctionArgs<typeof tokenSearchQueryKey>) {
  const queryParams: {
    keys: string;
    list: TokenSearchListId;
    threshold: TokenSearchThreshold;
    query?: string;
    fromChainId?: number;
  } = {
    keys: keys.join(','),
    list,
    threshold,
    query,
  };
  if (fromChainId) {
    queryParams.fromChainId = fromChainId;
  }
  if (isAddress(query)) {
    queryParams.keys = `networks.${chainId}.address`;
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
  { chainId, fromChainId, keys, list, threshold, query }: TokenSearchArgs,
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
      keys,
      list,
      threshold,
      query,
    }),
    queryFn: tokenSearchQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Hook

export function useTokenSearch(
  { chainId, fromChainId, keys, list, threshold, query }: TokenSearchArgs,
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
      keys,
      list,
      threshold,
      query,
    }),
    queryFn: tokenSearchQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Hook

export function useTokenSearchAllNetworks(
  {
    keys,
    list,
    threshold,
    query,
  }: Omit<TokenSearchArgs, 'chainId' | 'fromChainId'>,
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
        queryKey: tokenSearchQueryKey({
          chainId,
          keys,
          list,
          threshold,
          query,
        }),
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
