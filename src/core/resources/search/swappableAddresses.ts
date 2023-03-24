import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import { tokenSearchHttp } from '~/core/network/tokenSearch';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { ETH_ADDRESS } from '~/core/references';

// ///////////////////////////////////////////////
// Query Types

export type SwappableAddressesArgs = {
  addresses: (Address | typeof ETH_ADDRESS)[];
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
}: QueryFunctionArgs<typeof swappableAddressesQueryKey>): Promise<
  (Address | typeof ETH_ADDRESS)[]
> {
  const filteredAddresses = await tokenSearchHttp.post(`/${fromChainId}`, {
    addresses,
    toChainId,
  });
  return filteredAddresses?.data?.data || [];
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
  return await queryClient.fetchQuery(
    swappableAddressesQueryKey({
      addresses,
      fromChainId,
      toChainId,
    }),
    swappableAddressesQueryFunction,
    config,
  );
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
  return useQuery(
    swappableAddressesQueryKey({
      addresses,
      fromChainId,
      toChainId,
    }),
    swappableAddressesQueryFunction,
    config,
  );
}
