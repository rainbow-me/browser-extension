import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { ParsedAssetsDictByChain } from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';
import { chainIdFromChainName } from '~/core/utils/chains';

import {
  fetchUserAssetsByChain,
  useUserAssetsByChain,
} from './userAssetsByChain';

const USER_ASSETS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type UserAssetsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
};

// ///////////////////////////////////////////////
// Query Key

const userAssetsQueryKey = ({ address, currency }: UserAssetsArgs) =>
  createQueryKey('userAssets', { address, currency }, { persisterVersion: 1 });

type UserAssetsQueryKey = ReturnType<typeof userAssetsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function userAssetsQueryFunctionByChain({
  address,
  currency,
}: {
  address?: Address;
  currency: SupportedCurrencyKey;
}): Promise<ParsedAssetsDictByChain> {
  const queries = [];
  const cache = queryClient.getQueryCache();
  const cachedUserAssets = cache.find(userAssetsQueryKey({ address, currency }))
    ?.state?.data as ParsedAssetsDictByChain;
  const getResultsForChain = async (chain: ChainName) => {
    const results = await fetchUserAssetsByChain(
      { address, chain, currency },
      { cacheTime: 0 },
    );
    const chainId = chainIdFromChainName(chain);
    const cachedDataForChain = cachedUserAssets?.[chainId];
    return {
      [chainId]:
        results ?? Object.keys(results).length ? results : cachedDataForChain,
    };
  };
  for (const chain in ChainName) {
    queries.push(getResultsForChain(chain as ChainName));
  }
  const results = await Promise.all(queries);
  return Object.assign({}, ...results);
}

async function userAssetsQueryFunction({
  queryKey: [{ address, currency }],
}: QueryFunctionArgs<typeof userAssetsQueryKey>) {
  return await userAssetsQueryFunctionByChain({ address, currency });
}

type UserAssetsResult = QueryFunctionResult<typeof userAssetsQueryFunction>;

// ///////////////////////////////////////////////
// Query Hook

export function useUserAssets<TSelectResult = UserAssetsResult>(
  { address, currency }: UserAssetsArgs,
  config: QueryConfig<
    UserAssetsResult,
    Error,
    TSelectResult,
    UserAssetsQueryKey
  > = {},
) {
  const { data: mainnetAssets } = useUserAssetsByChain({
    address,
    currency,
    chain: ChainName.mainnet,
  });
  const { data: optimismAssets } = useUserAssetsByChain({
    address,
    currency,
    chain: ChainName.optimism,
  });
  const { data: bscAssets } = useUserAssetsByChain({
    address,
    currency,
    chain: ChainName.bsc,
  });
  const { data: polygonAssets } = useUserAssetsByChain({
    address,
    currency,
    chain: ChainName.polygon,
  });
  const { data: arbitrumAssets } = useUserAssetsByChain({
    address,
    currency,
    chain: ChainName.arbitrum,
  });
  return useQuery(
    userAssetsQueryKey({ address, currency }),
    () => ({
      [ChainId.mainnet]: mainnetAssets ?? {},
      [ChainId.optimism]: optimismAssets ?? {},
      [ChainId.bsc]: bscAssets ?? {},
      [ChainId.polygon]: polygonAssets ?? {},
      [ChainId.arbitrum]: arbitrumAssets ?? {},
    }),
    {
      ...config,
      refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
    },
  );
}
