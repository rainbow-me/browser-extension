import { useQuery } from '@tanstack/react-query';

import {
  createQueryKey,
  queryClient,
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
} from '~/core/react-query';
import { refractionAddressWs, refractionAddressMessages } from '~/core/network';
import { useEffect } from 'react';
import { useAddressSocket } from '~/entries/popup/hooks/useAddressSocket';

const USER_ASSETS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type UserAssetsArgs = {
  address?: string;
  currency?: string;
};

// ///////////////////////////////////////////////
// Query Key

const userAssetsQueryKey = ({ address, currency }: UserAssetsArgs) =>
  createQueryKey('userAssets', { address, currency }, { persisterVersion: 1 });

type UserAssetsQueryKey = ReturnType<typeof userAssetsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function userAssetsQueryFunction({
  queryKey: [{ address, currency }],
}: QueryFunctionArgs<typeof userAssetsQueryKey>) {
  refractionAddressWs.emit('get', {
    payload: {
      address,
      currency,
    },
    scope: ['assets'],
  });
  return [];
}

type UserAssetsResult = QueryFunctionResult<typeof userAssetsQueryFunction>;

// ///////////////////////////////////////////////
// Query Hook

export function useUserAssets(
  { address, currency = 'usd' }: UserAssetsArgs,
  config: QueryConfig<UserAssetsResult, Error, UserAssetsQueryKey> = {},
) {
  useAddressSocket({ address, currency });
  useEffect(() => {
    refractionAddressWs.on(
      refractionAddressMessages.ADDRESS_ASSETS.RECEIVED,
      (message) => {
        console.log(refractionAddressMessages.ADDRESS_ASSETS.RECEIVED, message);
        queryClient.setQueryData(
          userAssetsQueryKey({ address, currency }),
          Object.values(message?.payload?.assets).map((item) => ({
            symbol: item?.asset?.symbol,
            quantity: item?.quantity,
          })),
        );
      },
    );
  }, [address, currency]);
  return useQuery(
    userAssetsQueryKey({ address, currency }),
    userAssetsQueryFunction,
    {
      ...config,
      refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
    },
  );
}
