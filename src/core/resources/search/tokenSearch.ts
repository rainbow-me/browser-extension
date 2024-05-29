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
import {
  BNB_BSC_ADDRESS,
  ETH_ADDRESS,
  MATIC_POLYGON_ADDRESS,
} from '~/core/references';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { ChainId } from '~/core/types/chains';
import {
  SearchAsset,
  TokenSearchAssetKey,
  TokenSearchListId,
  TokenSearchThreshold,
} from '~/core/types/search';
import { getSupportedChains, isCustomChain } from '~/core/utils/chains';
import { useUserChains } from '~/entries/popup/hooks/useUserChains';

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
    return parseTokenSearch(tokenSearch.data.data, chainId);
  } catch (e) {
    return [];
  }
}

function parseTokenSearch(assets: SearchAsset[], chainId: ChainId) {
  return assets
    .map((a) => {
      const networkInfo = a.networks[chainId];

      const asset: SearchAsset = {
        ...a,
        address: networkInfo ? networkInfo.address : a.address,
        chainId,
        decimals: networkInfo ? networkInfo.decimals : a.decimals,
        isNativeAsset: [
          `${ETH_ADDRESS}_${ChainId.mainnet}`,
          `${ETH_ADDRESS}_${ChainId.optimism}`,
          `${ETH_ADDRESS}_${ChainId.arbitrum}`,
          `${BNB_BSC_ADDRESS}_${ChainId.bsc}`,
          `${MATIC_POLYGON_ADDRESS}_${ChainId.polygon}`,
          `${ETH_ADDRESS}_${ChainId.base}`,
          `${ETH_ADDRESS}_${ChainId.zora}`,
          `${ETH_ADDRESS}_${ChainId.avalanche}`,
          `${ETH_ADDRESS}_${ChainId.blast}`,
          `${ETH_ADDRESS}_${ChainId.degen}`,
        ].includes(`${a.uniqueId}_${chainId}`),
        mainnetAddress: a.uniqueId as Address,
        uniqueId: `${networkInfo?.address || a.uniqueId}_${chainId}`,
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
  const { testnetMode } = useTestnetModeStore();

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
        select: (data: SearchAsset[]) => {
          if (!isAddress(query) || testnetMode) return [];
          return data;
        },
        // testnet is not supported at the moment
        enabled: isAddress(query) && !testnetMode,
        refetchOnWindowFocus: false,
        staleTime: 10 * 60 * 1_000, // 10 min
        ...config,
      };
    }),
  });

  return {
    data: queries.map(({ data: assets }) => assets || []).flat(),
    isFetching: queries.some(({ isFetching }) => isFetching),
  };
}
