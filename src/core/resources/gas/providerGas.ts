import { useQuery } from '@tanstack/react-query';
import { formatGwei } from 'viem';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { ChainId } from '~/core/types/chains';
import { getViemClient } from '~/core/viem/clients';

import { MeteorologyLegacyResponse } from './meteorology';

// ///////////////////////////////////////////////
// Query Types

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ProviderGasArgs = {
  chainId: ChainId;
};

// ///////////////////////////////////////////////
// Query Key

const providerGasQueryKey = ({ chainId }: ProviderGasArgs) =>
  createQueryKey('providerGas', { chainId }, { persisterVersion: 1 });

type ProviderGasQueryKey = ReturnType<typeof providerGasQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function providerGasQueryFunction({
  queryKey: [{ chainId }],
}: QueryFunctionArgs<typeof providerGasQueryKey>) {
  const client = getViemClient({ chainId });

  const gasPrice = await client.getGasPrice();
  const gweiGasPrice = formatGwei(gasPrice);

  const providerGasData: MeteorologyLegacyResponse = {
    data: {
      legacy: {
        fastGasPrice: gweiGasPrice,
        proposeGasPrice: gweiGasPrice,
        safeGasPrice: gweiGasPrice,
      },
    },
    meta: {
      feeType: 'legacy',
      blockNumber: 0,
      provider: 'provider',
    },
  };

  return providerGasData;
}

type ProviderGasResult = QueryFunctionResult<typeof providerGasQueryFunction>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function getProviderGas(
  { chainId }: ProviderGasArgs,
  config: QueryConfig<
    ProviderGasResult,
    Error,
    ProviderGasResult,
    ProviderGasQueryKey
  > = {},
) {
  return await queryClient.fetchQuery({
    queryKey: providerGasQueryKey({ chainId }),
    queryFn: providerGasQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Hook

export function useProviderGas(
  { chainId }: ProviderGasArgs,
  config: QueryConfig<
    ProviderGasResult,
    Error,
    ProviderGasResult,
    ProviderGasQueryKey
  > = {},
) {
  return useQuery({
    queryKey: providerGasQueryKey({ chainId }),
    queryFn: providerGasQueryFunction,
    ...config,
  });
}
