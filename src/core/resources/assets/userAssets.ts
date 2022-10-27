import { useQuery } from '@tanstack/react-query';

import { refractionAddressMessages, refractionAddressWs } from '~/core/network';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { AddressAssetsReceivedMessage } from '~/core/types/refraction';

const USER_ASSETS_TIMEOUT_DURATION = 10000;
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
}: QueryFunctionArgs<
  typeof userAssetsQueryKey
>): Promise<AddressAssetsReceivedMessage> {
  refractionAddressWs.emit('get', {
    payload: {
      address,
      currency: currency?.toLowerCase(),
    },
    scope: ['assets'],
  });
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      refractionAddressWs.removeEventListener(
        refractionAddressMessages.ADDRESS_ASSETS.RECEIVED,
        resolver,
      );
      resolve(
        queryClient.getQueryData(userAssetsQueryKey({ address, currency })) ||
          {},
      );
    }, USER_ASSETS_TIMEOUT_DURATION);
    const resolver = (message: AddressAssetsReceivedMessage) => {
      clearTimeout(timeout);
      refractionAddressWs.removeEventListener(
        refractionAddressMessages.ADDRESS_ASSETS.RECEIVED,
        resolver,
      );
      resolve(parseUserAssets(message));
    };
    refractionAddressWs.on(
      refractionAddressMessages.ADDRESS_ASSETS.RECEIVED,
      resolver,
    );
  });
}

type UserAssetsResult = QueryFunctionResult<typeof userAssetsQueryFunction>;

function parseUserAssets(message: AddressAssetsReceivedMessage) {
  const data = message?.payload?.assets || {};
  // do transforms here
  return data;
}

// ///////////////////////////////////////////////
// Query Hook

export function useUserAssets(
  { address, currency }: UserAssetsArgs,
  config: QueryConfig<UserAssetsResult, Error, UserAssetsQueryKey> = {},
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
