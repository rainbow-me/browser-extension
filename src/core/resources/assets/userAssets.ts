import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import { refractionAddressWs } from '~/core/network';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { ParsedAssetsDictByChain } from '~/core/types/assets';
import { ChainName } from '~/core/types/chains';

import { fetchUserAssetsByChain } from './userAssetsByChain';

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
  const getResultsForChain = async (chain: ChainName) => {
    const results = await fetchUserAssetsByChain({ address, chain, currency });
    return {
      [chain]: results,
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
  refractionAddressWs.emit('get', {
    payload: {
      address,
      currency: currency?.toLowerCase(),
    },
    scope: ['assets'],
  });
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
  return useQuery(
    userAssetsQueryKey({ address, currency }),
    userAssetsQueryFunction,
    {
      ...config,
      refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
    },
  );
}
