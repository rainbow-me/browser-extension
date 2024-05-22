import { useQuery } from '@tanstack/react-query';

import { tokenSearchHttp } from '~/core/network/tokenSearch';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { AddressOrEth } from '~/core/types/assets';

// ///////////////////////////////////////////////
// Query Types

export type SwappableAddressesArgs = {
  addresses: AddressOrEth[];
  fromChainId: number;
  toChainId?: number;
};

// ///////////////////////////////////////////////
// Query Key

const swappableAddressesQueryKey = ({
  addresses,
  fromChainId,
  toChainId,
}: SwappableAddressesArgs) =>
  createQueryKey(
    'SwappableAddresses',
    { addresses, fromChainId, toChainId },
    { persisterVersion: 1 },
  );

type SwappableAddressesQueryKey = ReturnType<typeof swappableAddressesQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function swappableAddressesQueryFunction({
  queryKey: [{ addresses, fromChainId, toChainId }],
}: QueryFunctionArgs<typeof swappableAddressesQueryKey>) {
  const filteredAddresses = await tokenSearchHttp.post<{
    data?: AddressOrEth[];
  }>(`/${fromChainId}`, {
    addresses,
    toChainId,
  });
  return filteredAddresses.data.data || [];
}

type SwappableAddressesResult = QueryFunctionResult<
  typeof swappableAddressesQueryFunction
>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchSwappableAddresses(
  { addresses, fromChainId, toChainId }: SwappableAddressesArgs,
  config: QueryConfig<
    SwappableAddressesResult,
    Error,
    SwappableAddressesResult,
    SwappableAddressesQueryKey
  > = {},
) {
  return await queryClient.fetchQuery({
    queryKey: swappableAddressesQueryKey({
      addresses,
      fromChainId,
      toChainId,
    }),
    queryFn: swappableAddressesQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Hook

export function useSwappableAddresses<TSelectResult = SwappableAddressesResult>(
  { addresses, fromChainId, toChainId }: SwappableAddressesArgs,
  config: QueryConfig<
    SwappableAddressesResult,
    Error,
    TSelectResult,
    SwappableAddressesQueryKey
  > = {},
) {
  return useQuery({
    queryKey: swappableAddressesQueryKey({
      addresses,
      fromChainId,
      toChainId,
    }),
    queryFn: swappableAddressesQueryFunction,
    ...config,
  });
}
