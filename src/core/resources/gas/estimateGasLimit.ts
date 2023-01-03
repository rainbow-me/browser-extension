import { TransactionRequest } from '@ethersproject/abstract-provider';
import { ChainId } from '@rainbow-me/swaps';
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
import { ethUnits } from '~/core/references';
import { estimateGas } from '~/core/utils/gas';

// ///////////////////////////////////////////////
// Query Types

export type EstimateGasLimitResponse = {
  gasLimit: string;
};

export type EstimateGasLimitArgs = {
  chainId: Chain['id'];
  transactionRequest: TransactionRequest;
};

// ///////////////////////////////////////////////
// Query Key

const estimateGasLimitQueryKey = ({
  chainId,
  transactionRequest,
}: EstimateGasLimitArgs) =>
  createQueryKey(
    'estimateGasLimit',
    { chainId, transactionRequest },
    { persisterVersion: 1 },
  );

type EstimateGasLimitQueryKey = ReturnType<typeof estimateGasLimitQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function estimateGasLimitQueryFunction({
  queryKey: [{ chainId, transactionRequest }],
}: QueryFunctionArgs<typeof estimateGasLimitQueryKey>) {
  const provider = getProvider({ chainId });
  const gasLimit = await estimateGas({
    transactionRequest,
    provider,
  });

  if (!gasLimit) {
    if (chainId === ChainId.arbitrum) {
      return `${ethUnits.arbitrum_basic_tx}`;
    }
    return transactionRequest?.data === '0x'
      ? `${ethUnits.basic_tx}`
      : `${ethUnits.basic_transfer}`;
  }
  return gasLimit;
}

type EstimateGasLimitResult = QueryFunctionResult<
  typeof estimateGasLimitQueryFunction
>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchEstimateGasLimit(
  { chainId, transactionRequest }: EstimateGasLimitArgs,
  config: QueryConfig<
    EstimateGasLimitResult,
    Error,
    EstimateGasLimitResult,
    EstimateGasLimitQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    estimateGasLimitQueryKey({ chainId, transactionRequest }),
    estimateGasLimitQueryFunction,
    config,
  );
}

// ///////////////////////////////////////////////
// Query Hook

export function useEstimateGasLimit(
  { chainId, transactionRequest }: EstimateGasLimitArgs,
  config: QueryConfig<
    EstimateGasLimitResult,
    Error,
    EstimateGasLimitResult,
    EstimateGasLimitQueryKey
  > = {},
) {
  return useQuery(
    estimateGasLimitQueryKey({ chainId, transactionRequest }),
    estimateGasLimitQueryFunction,
    { keepPreviousData: true, ...config },
  );
}
