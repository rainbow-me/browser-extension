import { TransactionRequest } from '@ethersproject/abstract-provider';
import { useQuery } from '@tanstack/react-query';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';
import { calculateL1FeeOptimism } from '~/core/utils/gas';
import { getProvider } from '~/core/wagmi/clientToProvider';

// ///////////////////////////////////////////////
// Query Types

type OptimismL1SecurityFeeArgs = {
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
  const needsL1SecurityFeeChains = useNetworkStore
    .getState()
    .getNeedsL1SecurityFeeChainIds();
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchOptimismL1SecurityFee(
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
  const needsL1SecurityFeeChains = useNetworkStore((state) =>
    state.getNeedsL1SecurityFeeChainIds(),
  );
  return useQuery({
    queryKey: optimismL1SecurityFeeQueryKey({ transactionRequest, chainId }),
    queryFn: optimismL1SecurityFeeQueryFunction,
    ...config,
    placeholderData: (previousData) =>
      needsL1SecurityFeeChains.includes(chainId) ? previousData : null,
  });
}
