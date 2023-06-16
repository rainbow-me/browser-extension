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
import { ChainName } from '~/core/types/chains';
import { chainIdFromChainName } from '~/core/utils/chains';

import { fetchUserAssetsByChain } from './userAssetsByChain';

const USER_ASSETS_REFETCH_INTERVAL = 60000;
const REFRACTION_SUPPORTED_CHAINS = [
  ChainName.mainnet,
  ChainName.optimism,
  ChainName.polygon,
  ChainName.arbitrum,
  ChainName.bsc,
];

// ///////////////////////////////////////////////
// Query Types

export type UserAssetsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
  connectedToHardhat: boolean;
};

type SetUserAssetsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
  connectedToHardhat: boolean;
  userAssets: UserAssetsResult;
};

// ///////////////////////////////////////////////
// Query Key

const userAssetsQueryKey = ({
  address,
  currency,
  connectedToHardhat,
}: UserAssetsArgs) =>
  createQueryKey(
    'userAssets',
    { address, currency, connectedToHardhat },
    { persisterVersion: 2 },
  );

type UserAssetsQueryKey = ReturnType<typeof userAssetsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

export const userAssetsSetQueryData = ({
  address,
  currency,
  connectedToHardhat,
  userAssets,
}: SetUserAssetsArgs) => {
  queryClient.setQueryData(
    userAssetsQueryKey({ address, currency, connectedToHardhat }),
    userAssets,
  );
};

async function userAssetsQueryFunctionByChain({
  address,
  currency,
  connectedToHardhat,
}: UserAssetsArgs) {
  const cache = queryClient.getQueryCache();
  const cachedUserAssets = cache.find(
    userAssetsQueryKey({ address, currency, connectedToHardhat }),
  )?.state?.data as ParsedAssetsDictByChain;
  const getResultsForChain = async (chain: ChainName) => {
    const results =
      (await fetchUserAssetsByChain(
        { address, chain, currency, connectedToHardhat },
        { cacheTime: 0 },
      )) || {};
    const chainId = chainIdFromChainName(chain);
    const cachedDataForChain = cachedUserAssets?.[chainId] || {};
    return {
      [chainId]:
        results && Object.keys(results).length ? results : cachedDataForChain,
    };
  };
  const queries = REFRACTION_SUPPORTED_CHAINS.map((chain) =>
    getResultsForChain(chain),
  );
  try {
    const results = await Promise.all(queries);
    return Object.assign({}, ...results) as ParsedAssetsDictByChain;
  } catch (e) {
    return cachedUserAssets;
  }
}

async function userAssetsQueryFunction({
  queryKey: [{ address, currency, connectedToHardhat }],
}: QueryFunctionArgs<typeof userAssetsQueryKey>) {
  return await userAssetsQueryFunctionByChain({
    address,
    currency,
    connectedToHardhat,
  });
}

type UserAssetsResult = QueryFunctionResult<typeof userAssetsQueryFunction>;

// ///////////////////////////////////////////////
// Query Hook

export function useUserAssets<TSelectResult = UserAssetsResult>(
  { address, currency, connectedToHardhat }: UserAssetsArgs,
  config: QueryConfig<
    UserAssetsResult,
    Error,
    TSelectResult,
    UserAssetsQueryKey
  > = {},
) {
  return useQuery(
    userAssetsQueryKey({ address, currency, connectedToHardhat }),
    userAssetsQueryFunction,
    {
      ...config,
      refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
    },
  );
}
