import { useQuery } from '@tanstack/react-query';

import {
  createQueryKey,
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
} from '~/core/react-query';
import { refractionAddressWs, refractionAddressMessages } from '~/core/network';
import { AddressAssetsReceivedMessage } from '~/core/network/refractionAddressWs';
import { usePopupStore } from '~/core/state';

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
      currency,
    },
    scope: ['assets'],
  });
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      refractionAddressWs.removeEventListener(
        refractionAddressMessages.ADDRESS_ASSETS.RECEIVED,
        resolver,
      );
      resolve({});
    }, 10000);
    const resolver = (message: AddressAssetsReceivedMessage) => {
      clearTimeout(timeout);
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

// This should be refactored to use wagmi.useAccount
export function useUserAssets(
  config: QueryConfig<UserAssetsResult, Error, UserAssetsQueryKey> = {},
) {
  const [currentAddress, currentCurrency] = usePopupStore((state) => [
    state.currentAddress,
    state.currentCurrency,
  ]);
  return useQuery(
    userAssetsQueryKey({ address: currentAddress, currency: currentCurrency }),
    userAssetsQueryFunction,
    {
      ...config,
      refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
    },
  );
}
