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
import { AddressAssetsReceivedMessage } from '~/core/network/refractionAddressWs';

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
  // continue to display last message's data while waiting for listener to populate query cache
  return queryClient.getQueryData(
    userAssetsQueryKey({ address, currency }),
  ) as AddressAssetsReceivedMessage;
}

type UserAssetsResult = QueryFunctionResult<typeof userAssetsQueryFunction>;

function parseUserAssets(message: AddressAssetsReceivedMessage) {
  const data = message?.payload?.assets || {};
  // do transforms here
  return data;
}

// ///////////////////////////////////////////////
// Query Hook

// This should be refactored to use wagmi.useAccount
export function useUserAssets(
  { address, currency = 'usd' }: UserAssetsArgs,
  config: QueryConfig<UserAssetsResult, Error, UserAssetsQueryKey> = {},
) {
  useEffect(() => {
    refractionAddressWs.on(
      refractionAddressMessages.ADDRESS_ASSETS.RECEIVED,
      (message: AddressAssetsReceivedMessage) => {
        console.log(refractionAddressMessages.ADDRESS_ASSETS.RECEIVED, message);
        queryClient.setQueryData(
          userAssetsQueryKey({ address, currency }),
          parseUserAssets(message),
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
