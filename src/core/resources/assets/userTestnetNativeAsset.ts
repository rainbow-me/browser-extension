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
import { ChainId, ChainName, ChainNameDisplay } from '~/core/types/chains';
import { fetchAssetBalanceViaProvider } from '~/core/utils/assets';
import { ETH_MAINNET_ASSET } from '~/test/utils';

const USER_ASSETS_REFETCH_INTERVAL = 60000;
export const USER_ASSETS_STALE_INTERVAL = 30000;

// ///////////////////////////////////////////////
// Query Types

type UserTestnetNativeAssetArgs = {
  address: Address;
  currency: SupportedCurrencyKey;
  chainId: ChainId;
};

// ///////////////////////////////////////////////
// Query Key

export const userTestnetNativeAssetQueryKey = ({
  address,
  currency,
  chainId,
}: UserTestnetNativeAssetArgs) =>
  createQueryKey(
    'userTestnetNativeAsset',
    { address, currency, chainId },
    { persisterVersion: 1 },
  );

type UserTestnetNativeAssetQueryKey = ReturnType<
  typeof userTestnetNativeAssetQueryKey
>;

// ///////////////////////////////////////////////
// Query Function

async function userTestnetNativeAssetQueryFunction({
  queryKey: [{ address, currency, chainId }],
}: QueryFunctionArgs<typeof userTestnetNativeAssetQueryKey>) {
  try {
    const provider = getProvider({ chainId });
    const nativeAsset = {
      ...ETH_MAINNET_ASSET,
      chainId,
      chainName: ChainNameDisplay[chainId] as ChainName,
    };
    const _parsedAsset = await fetchAssetBalanceViaProvider({
      parsedAsset: nativeAsset,
      currentAddress: address,
      currency,
      provider,
    });
    return _parsedAsset;
  } catch (e) {
    return null;
  }
}

type UserAssetsResult = QueryFunctionResult<
  typeof userTestnetNativeAssetQueryFunction
>;

// ///////////////////////////////////////////////
// Query Hook

export function useUserTestnetNativeAsset(
  { address, currency, chainId }: UserTestnetNativeAssetArgs,
  config: QueryConfig<
    UserAssetsResult,
    Error,
    UserAssetsResult,
    UserTestnetNativeAssetQueryKey
  > = {},
) {
  return useQuery(
    userTestnetNativeAssetQueryKey({
      address,
      currency,
      chainId,
    }),
    userTestnetNativeAssetQueryFunction,
    {
      ...config,
      refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
    },
  );
}
