import { TransactionRequest } from '@ethersproject/abstract-provider';
import { useQuery } from '@tanstack/react-query';
import { chain, getProvider } from '@wagmi/core';
import { Chain } from 'wagmi';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { weiToGwei } from '~/core/utils/ethereum';
import { calculateL1FeeOptimism } from '~/core/utils/gas';
import { add } from '~/core/utils/numbers';

import { MeteorologyLegacyResponse } from './meteorology';

// ///////////////////////////////////////////////
// Query Types

export type ProviderGasArgs = {
  chainId: Chain['id'];
  transactionRequest: TransactionRequest;
};

// ///////////////////////////////////////////////
// Query Key

const providerGasQueryKey = ({
  chainId,
  transactionRequest,
}: ProviderGasArgs) =>
  createQueryKey(
    'providerGas',
    { chainId, transactionRequest },
    { persisterVersion: 1 },
  );

type ProviderGasQueryKey = ReturnType<typeof providerGasQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function providerGasQueryFunction({
  queryKey: [{ chainId, transactionRequest }],
}: QueryFunctionArgs<typeof providerGasQueryKey>) {
  const provider = getProvider({ chainId });
  const gasPrice = await provider.getGasPrice();
  let gweiGasPrice = weiToGwei(gasPrice.toString());

  if (chainId === chain.optimism.id) {
    let optimismL1GasGwei = '0';
    const l1Gas = await calculateL1FeeOptimism({
      transactionRequest,
      currentGasPrice: gasPrice.toString(),
      provider,
    });
    optimismL1GasGwei = weiToGwei(l1Gas?.toString() || '0');
    gweiGasPrice = add(gweiGasPrice, optimismL1GasGwei);
  }

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
  { chainId, transactionRequest }: ProviderGasArgs,
  config: QueryConfig<
    ProviderGasResult,
    Error,
    ProviderGasResult,
    ProviderGasQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    providerGasQueryKey({ chainId, transactionRequest }),
    providerGasQueryFunction,
    config,
  );
}

// ///////////////////////////////////////////////
// Query Hook

export function useProviderGas(
  { chainId, transactionRequest }: ProviderGasArgs,
  config: QueryConfig<
    ProviderGasResult,
    Error,
    ProviderGasResult,
    ProviderGasQueryKey
  > = {},
) {
  return useQuery(
    providerGasQueryKey({ chainId, transactionRequest }),
    providerGasQueryFunction,
    config,
  );
}
