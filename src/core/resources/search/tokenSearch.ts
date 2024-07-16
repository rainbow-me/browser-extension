import { isAddress } from '@ethersproject/address';
import { useQueries, useQuery } from '@tanstack/react-query';
import qs from 'qs';
import { Address } from 'viem';

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
import {
  getSupportedChains,
  isCustomChain,
  isNativeAsset,
} from '~/core/utils/chains';

const ALL_VERIFIED_TOKENS_PARAM = '/?list=verifiedAssets';

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

  const isAddressSearch = query && isAddress(query);
  if (isAddressSearch) {
    queryParams.keys = `networks.${chainId}.address`;
  }

  const isSearchingVerifiedAssets = queryParams.list === 'verifiedAssets';
  const url = `/${chainId}/?${qs.stringify(queryParams)}`;
  const tokenSearch = await tokenSearchHttp.get<{ data: SearchAsset[] }>(url);

  if (isAddressSearch && isSearchingVerifiedAssets) {
    if (tokenSearch && tokenSearch.data.data.length > 0) {
      return parseTokenSearch(tokenSearch.data.data, chainId);
    }
    const allVerifiedTokens = await tokenSearchHttp.get<{
      data: SearchAsset[];
    }>(ALL_VERIFIED_TOKENS_PARAM);

    const addressQuery = query?.trim()?.toLowerCase() || '';
    const addressMatchesOnOtherChains = allVerifiedTokens.data.data.filter(
      (a) => Object.values(a.networks).some((n) => n?.address === addressQuery),
    );
    return parseTokenSearch(addressMatchesOnOtherChains, chainId);
  } else {
    return parseTokenSearch(tokenSearch.data.data, chainId);
  }
}

function parseTokenSearch(assets: SearchAsset[], chainId: ChainId) {
  return assets
    .map((a) => {
      const networkInfo = a.networks[chainId];
      const mainnetInfo = a.networks[ChainId.mainnet];
      const address = networkInfo ? networkInfo.address : a.address;
      const decimals = networkInfo ? networkInfo.decimals : a.decimals;
      const uniqueId = `${address}_${chainId}`;
      const mainnetAddress =
        mainnetInfo?.address ?? chainId === ChainId.mainnet
          ? address
          : ('' as Address);

      const asset: SearchAsset = {
        ...a,
        address,
        chainId,
        decimals,
        isNativeAsset: isNativeAsset(a.address, chainId),
        mainnetAddress,
        uniqueId,
      };

      return asset;
    })
    .filter(Boolean);
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
    placeholderData: (previousData) => previousData,
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
