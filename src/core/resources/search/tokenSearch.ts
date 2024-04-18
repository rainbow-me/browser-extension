import { isAddress } from '@ethersproject/address';
import { useQuery } from '@tanstack/react-query';
import qs from 'qs';
import { Address } from 'wagmi';

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
      return {
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
