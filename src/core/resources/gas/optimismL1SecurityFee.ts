import { TransactionRequest } from '@ethersproject/abstract-provider';
import { ChainId } from '@rainbow-me/swaps';
import { useQuery } from '@tanstack/react-query';
import { getProvider } from '@wagmi/core';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { calculateL1FeeOptimism } from '~/core/utils/gas';

// ///////////////////////////////////////////////
// Query Types

export type OptimismL1SecurityFeeResponse = {
  l1Gas: string;
};

export type OptimismL1SecurityFeeArgs = {
  transactionRequest: TransactionRequest;
};

// ///////////////////////////////////////////////
// Query Key

const optimismL1SecurityFeeQueryKey = ({
  transactionRequest,
}: OptimismL1SecurityFeeArgs) =>
  createQueryKey(
    'optimismL1SecrityFee',
    { transactionRequest },
    { persisterVersion: 1 },
  );

type OptimismL1SecurityFeeQueryKey = ReturnType<
  typeof optimismL1SecurityFeeQueryKey
>;

// ///////////////////////////////////////////////
// Query Function

async function optimismL1SecurityFeeQueryFunction({
  queryKey: [{ transactionRequest }],
}: QueryFunctionArgs<typeof optimismL1SecurityFeeQueryKey>) {
  const provider = getProvider({ chainId: ChainId.optimism });
  const gasPrice = await provider.getGasPrice();
  const l1Fee = await calculateL1FeeOptimism({
    currentGasPrice: gasPrice.toString(),
    transactionRequest,
    provider,
  });
  const l1GasFeeGwei = l1Fee?.toString() || '0';
  return l1GasFeeGwei;
}

type OptimismL1SecurityFeeResult = QueryFunctionResult<
  typeof optimismL1SecurityFeeQueryFunction
>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchOptimismL1SecurityFee(
  { transactionRequest }: OptimismL1SecurityFeeArgs,
  config: QueryConfig<
    OptimismL1SecurityFeeResult,
    Error,
    OptimismL1SecurityFeeResult,
    OptimismL1SecurityFeeQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    optimismL1SecurityFeeQueryKey({ transactionRequest }),
    optimismL1SecurityFeeQueryFunction,
    config,
  );
}

// ///////////////////////////////////////////////
// Query Hook

export function useOptimismL1SecurityFee(
  { transactionRequest }: OptimismL1SecurityFeeArgs,
  config: QueryConfig<
    OptimismL1SecurityFeeResult,
    Error,
    OptimismL1SecurityFeeResult,
    OptimismL1SecurityFeeQueryKey
  > = {},
) {
  return useQuery(
    optimismL1SecurityFeeQueryKey({ transactionRequest }),
    optimismL1SecurityFeeQueryFunction,
    { keepPreviousData: true, ...config },
  );
}
