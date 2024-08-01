import { TransactionRequest } from '@ethersproject/abstract-provider';
import { useQuery } from '@tanstack/react-query';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { needsL1SecurityFeeChains } from '~/core/references/chains';
import { ChainId } from '~/core/types/chains';
import { calculateL1FeeOptimism } from '~/core/utils/gas';
import { getProvider } from '~/core/wagmi/clientToProvider';

// ///////////////////////////////////////////////
// Query Types

export type OptimismL1SecurityFeeResponse = {
  l1Gas: string;
};

export type OptimismL1SecurityFeeArgs = {
  transactionRequest: TransactionRequest;
  chainId: ChainId;
};

// ///////////////////////////////////////////////
// Query Key

const optimismL1SecurityFeeQueryKey = ({
  transactionRequest,
  chainId,
}: OptimismL1SecurityFeeArgs) =>
  createQueryKey(
    'optimismL1SecrityFee',
    { transactionRequest, chainId },
    { persisterVersion: 1 },
  );

type OptimismL1SecurityFeeQueryKey = ReturnType<
  typeof optimismL1SecurityFeeQueryKey
>;

// ///////////////////////////////////////////////
// Query Function

async function optimismL1SecurityFeeQueryFunction({
  queryKey: [{ transactionRequest, chainId }],
}: QueryFunctionArgs<typeof optimismL1SecurityFeeQueryKey>) {
  if (needsL1SecurityFeeChains.includes(chainId)) {
    const provider = getProvider({ chainId: ChainId.optimism });
    const gasPrice = await provider.getGasPrice();
    const l1Fee = await calculateL1FeeOptimism({
      currentGasPrice: gasPrice.toString(),
      transactionRequest,
      provider,
    });
    const l1GasFeeGwei = l1Fee?.toString() || '0';
    return l1GasFeeGwei;
  } else {
    return null;
  }
}

type OptimismL1SecurityFeeResult = QueryFunctionResult<
  typeof optimismL1SecurityFeeQueryFunction
>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchOptimismL1SecurityFee(
  { transactionRequest, chainId }: OptimismL1SecurityFeeArgs,
  config: QueryConfig<
    OptimismL1SecurityFeeResult,
    Error,
    OptimismL1SecurityFeeResult,
    OptimismL1SecurityFeeQueryKey
  > = {},
) {
  return await queryClient.fetchQuery({
    queryKey: optimismL1SecurityFeeQueryKey({ transactionRequest, chainId }),
    queryFn: optimismL1SecurityFeeQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Hook

export function useOptimismL1SecurityFee(
  { transactionRequest, chainId }: OptimismL1SecurityFeeArgs,
  config: QueryConfig<
    OptimismL1SecurityFeeResult,
    Error,
    OptimismL1SecurityFeeResult,
    OptimismL1SecurityFeeQueryKey
  > = {},
) {
  return useQuery({
    queryKey: optimismL1SecurityFeeQueryKey({ transactionRequest, chainId }),
    queryFn: optimismL1SecurityFeeQueryFunction,
    ...config,
    placeholderData: (previousData) =>
      needsL1SecurityFeeChains.includes(chainId) ? previousData : null,
  });
}
