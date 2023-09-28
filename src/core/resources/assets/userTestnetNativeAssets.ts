import { useQuery } from '@tanstack/react-query';
import { getProvider } from '@wagmi/core';
import { Address } from 'wagmi';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { ChainId } from '~/core/types/chains';
import { fetchAssetBalanceViaProvider } from '~/core/utils/assets';
import { ETH_MAINNET_ASSET } from '~/test/utils';

const USER_ASSETS_REFETCH_INTERVAL = 60000;
export const USER_ASSETS_STALE_INTERVAL = 30000;

// ///////////////////////////////////////////////
// Query Types

type UserTestnetNativeAssetsArgs = {
  address: Address;
  currency: SupportedCurrencyKey;
};

// ///////////////////////////////////////////////
// Query Key

export const userTestnetNativeAssetsQueryKey = ({
  address,
  currency,
}: UserTestnetNativeAssetsArgs) =>
  createQueryKey(
    'userTestnetNativeAssets',
    { address, currency },
    { persisterVersion: 1 },
  );

type UserTestnetNativeAssetsQueryKey = ReturnType<
  typeof userTestnetNativeAssetsQueryKey
>;

// ///////////////////////////////////////////////
// Query Function

async function userTestnetNativeAssetsQueryFunction({
  queryKey: [{ address, currency }],
}: QueryFunctionArgs<typeof userTestnetNativeAssetsQueryKey>) {
  const provider = getProvider({ chainId: ChainId.hardhat });
  const hardhatEth = {
    ...ETH_MAINNET_ASSET,
    chainId: ChainId.hardhat,
  };
  const _parsedAsset = await fetchAssetBalanceViaProvider({
    parsedAsset: hardhatEth,
    currentAddress: address,
    currency,
    provider,
  });
  return [_parsedAsset];
}

type UserAssetsResult = QueryFunctionResult<
  typeof userTestnetNativeAssetsQueryFunction
>;

// ///////////////////////////////////////////////
// Query Hook

export function useUserTestnetNativeAssets<TSelectResult = UserAssetsResult>(
  { address, currency }: UserTestnetNativeAssetsArgs,
  config: QueryConfig<
    UserAssetsResult,
    Error,
    TSelectResult,
    UserTestnetNativeAssetsQueryKey
  > = {},
) {
  return useQuery(
    userTestnetNativeAssetsQueryKey({ address, currency }),
    userTestnetNativeAssetsQueryFunction,
    {
      ...config,
      refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
    },
  );
}
