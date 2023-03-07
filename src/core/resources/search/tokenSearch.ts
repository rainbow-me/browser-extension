import { isAddress } from '@ethersproject/address';
import { useQuery } from '@tanstack/react-query';
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
    { persisterVersion: 1 },
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queryParams.keys = `networks.${chainId}.address`;
  }
  const url = `/${chainId}/?${qs.stringify(queryParams)}`;
  try {
    const tokenSearch = await tokenSearchHttp.get(url);
    return parseTokenSearch(tokenSearch.data?.data, chainId) as SearchAsset[];
  } catch (e) {
    return [];
  }
}

function parseTokenSearch(assets: SearchAsset[], chainId: ChainId) {
  return assets.map((a) => ({
    ...a,
    address: a.networks[chainId]?.address,
    chainId,
    mainnetAddress: a.uniqueId,
    uniqueId: `${a.uniqueId}_${chainId}`,
  }));
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
  return await queryClient.fetchQuery(
    tokenSearchQueryKey({ chainId, fromChainId, keys, list, threshold, query }),
    tokenSearchQueryFunction,
    config,
  );
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
  return useQuery(
    tokenSearchQueryKey({ chainId, fromChainId, keys, list, threshold, query }),
    tokenSearchQueryFunction,
    config,
  );
}
