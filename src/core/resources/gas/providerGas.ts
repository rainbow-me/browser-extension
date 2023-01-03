import { useQuery } from '@tanstack/react-query';
import { getProvider } from '@wagmi/core';
import { Chain } from 'wagmi';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { weiToGwei } from '~/core/utils/ethereum';

import { MeteorologyLegacyResponse } from './meteorology';

// ///////////////////////////////////////////////
// Query Types

export type ProviderGasArgs = {
  chainId: Chain['id'];
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
  const provider = getProvider({ chainId });
  const gasPrice = await provider.getGasPrice();
  const gweiGasPrice = weiToGwei(gasPrice.toString());

  const parsedResponse = {
    data: {
      legacy: {
        fastGasPrice: gweiGasPrice,
        proposeGasPrice: gweiGasPrice,
        safeGasPrice: gweiGasPrice,
      },
      meta: {
        blockNumber: 0,
        provider: 'provider',
      },
    },
  };

  const providerGasData = parsedResponse as MeteorologyLegacyResponse;
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
  return await queryClient.fetchQuery(
    providerGasQueryKey({ chainId }),
    providerGasQueryFunction,
    config,
  );
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
  return useQuery(
    providerGasQueryKey({ chainId }),
    providerGasQueryFunction,
    config,
  );
}
