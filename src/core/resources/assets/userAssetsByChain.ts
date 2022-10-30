import { useQuery } from '@tanstack/react-query';
import { mapValues } from 'lodash';
import { Address } from 'wagmi';

import { refractionAddressWs } from '~/core/network';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainName } from '~/core/types/chains';
import { AddressAssetsReceivedMessage } from '~/core/types/refraction';
import { parseAsset } from '~/core/utils/assets';

const USER_ASSETS_TIMEOUT_DURATION = 10000;
const USER_ASSETS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type UserAssetsByChainArgs = {
  address?: Address;
  chain: ChainName;
  currency: SupportedCurrencyKey;
};

// ///////////////////////////////////////////////
// Query Key

export const userAssetsByChainQueryKey = ({
  address,
  chain,
  currency,
}: UserAssetsByChainArgs) =>
  createQueryKey(
    'userAssetsByChain',
    { address, chain, currency },
    { persisterVersion: 1 },
  );

type UserAssetsByChainQueryKey = ReturnType<typeof userAssetsByChainQueryKey>;

// ///////////////////////////////////////////////
// Query Function

export async function getAssetByChain(
  { address, chain, currency }: UserAssetsByChainArgs,
  resolver: (res: (value: unknown) => void) => () => void,
) {
  const isMainnet = chain === ChainName.mainnet;
  const scope = [`${isMainnet ? '' : chain + '-'}assets`];
  const event = `received address ${scope[0]}`;
  refractionAddressWs.emit('get', {
    payload: {
      address,
      currency: currency?.toLowerCase(),
    },
    scope,
  });
  return new Promise((resolve) => {
    refractionAddressWs.on(event, resolver(resolve));
  });
}

export async function fetchUserAssetsByChain<
  TSelectData = UserAssetsByChainResult,
>(
  { address, chain, currency }: UserAssetsByChainArgs,
  config: QueryConfig<
    UserAssetsByChainResult,
    Error,
    TSelectData,
    UserAssetsByChainQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    userAssetsByChainQueryKey({ address, chain, currency }),
    userAssetsByChainQueryFunction,
    config,
  );
}

export async function userAssetsByChainQueryFunction({
  queryKey: [{ address, chain, currency }],
}: QueryFunctionArgs<typeof userAssetsByChainQueryKey>): Promise<
  Record<string, ParsedAddressAsset>
> {
  const isMainnet = chain === ChainName.mainnet;
  const scope = [`${isMainnet ? '' : chain + '-'}assets`];
  const event = `received address ${scope[0]}`;
  refractionAddressWs.emit('get', {
    payload: {
      address,
      currency: currency?.toLowerCase(),
    },
    scope,
  });
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      refractionAddressWs.removeEventListener(event, resolver);
      resolve(
        queryClient.getQueryData(
          userAssetsByChainQueryKey({ address, chain, currency }),
        ) || {},
      );
    }, USER_ASSETS_TIMEOUT_DURATION);
    const resolver = (message: AddressAssetsReceivedMessage) => {
      clearTimeout(timeout);
      refractionAddressWs.removeEventListener(event, resolver);
      resolve(parseUserAssetsByChain(message, currency));
    };
    refractionAddressWs.on(event, resolver);
  });
}

type UserAssetsByChainResult = QueryFunctionResult<
  typeof userAssetsByChainQueryFunction
>;

function parseUserAssetsByChain(
  message: AddressAssetsReceivedMessage,
  currency: SupportedCurrencyKey,
) {
  return mapValues(message?.payload?.assets || {}, (assetData, address) =>
    parseAsset({
      address: address as Address,
      asset: assetData?.asset,
      currency,
      quantity: assetData?.quantity,
    }),
  );
}

// ///////////////////////////////////////////////
// Query Hook

export function useUserAssetsByChain<TSelectResult = UserAssetsByChainResult>(
  { address, chain, currency }: UserAssetsByChainArgs,
  config: QueryConfig<
    UserAssetsByChainResult,
    Error,
    TSelectResult,
    UserAssetsByChainQueryKey
  > = {},
) {
  return useQuery(
    userAssetsByChainQueryKey({ address, chain, currency }),
    userAssetsByChainQueryFunction,
    {
      ...config,
      refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
    },
  );
}
