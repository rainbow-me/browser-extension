import {
  CrosschainQuote,
  Quote,
  QuoteError,
  SwapType,
} from '@rainbow-me/swaps';
import { useQuery } from '@tanstack/react-query';

import { estimateSwapGasLimit } from '~/core/raps/actions';
import { estimateCrosschainSwapGasLimit } from '~/core/raps/actions/crosschainSwap';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { gasUnits } from '~/core/references/gasUnits';
import { ChainId } from '~/core/types/chains';

// ///////////////////////////////////////////////
// Query Types

export type EstimateSwapGasLimitResponse = {
  gasLimit: string;
};

export type EstimateSwapGasLimitArgs = {
  chainId: ChainId;
  tradeDetails?: Quote | CrosschainQuote | QuoteError;
  requiresApprove: boolean;
};

// ///////////////////////////////////////////////
// Query Key

const estimateSwapGasLimitQueryKey = ({
  chainId,
  tradeDetails,
  requiresApprove,
}: EstimateSwapGasLimitArgs) =>
  createQueryKey(
    'estimateSwapGasLimit',
    { chainId, tradeDetails, requiresApprove },
    { persisterVersion: 1 },
  );

type EstimateSwapGasLimitQueryKey = ReturnType<
  typeof estimateSwapGasLimitQueryKey
>;

// ///////////////////////////////////////////////
// Query Function

async function estimateSwapGasLimitQueryFunction({
  queryKey: [{ chainId, tradeDetails, requiresApprove }],
}: QueryFunctionArgs<typeof estimateSwapGasLimitQueryKey>) {
  if (!tradeDetails || (tradeDetails as QuoteError).error) {
    return gasUnits.basic_swap[chainId];
  }
  const quote = tradeDetails as Quote | CrosschainQuote;
  const isCrosschainSwap = quote.swapType === SwapType.crossChain;
  const gasLimit = isCrosschainSwap
    ? await estimateCrosschainSwapGasLimit({
        chainId,
        requiresApprove,
        tradeDetails: quote as CrosschainQuote,
      })
    : await estimateSwapGasLimit({
        chainId,
        requiresApprove,
        tradeDetails: quote as Quote,
      });

  if (!gasLimit) {
    return gasUnits.basic_swap[chainId];
  }
  return gasLimit;
}

type EstimateSwapGasLimitResult = QueryFunctionResult<
  typeof estimateSwapGasLimitQueryFunction
>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchEstimateSwapGasLimit(
  { chainId, tradeDetails, requiresApprove }: EstimateSwapGasLimitArgs,
  config: QueryConfig<
    EstimateSwapGasLimitResult,
    Error,
    EstimateSwapGasLimitResult,
    EstimateSwapGasLimitQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    estimateSwapGasLimitQueryKey({ chainId, tradeDetails, requiresApprove }),
    estimateSwapGasLimitQueryFunction,
    config,
  );
}

// ///////////////////////////////////////////////
// Query Hook

export function useEstimateSwapGasLimit(
  { chainId, tradeDetails, requiresApprove }: EstimateSwapGasLimitArgs,
  config: QueryConfig<
    EstimateSwapGasLimitResult,
    Error,
    EstimateSwapGasLimitResult,
    EstimateSwapGasLimitQueryKey
  > = {},
) {
  return useQuery(
    estimateSwapGasLimitQueryKey({ chainId, tradeDetails, requiresApprove }),
    estimateSwapGasLimitQueryFunction,
    { keepPreviousData: true, ...config },
  );
}
