import {
  CrosschainQuote,
  Quote,
  QuoteError,
  SwapType,
} from '@rainbow-me/swaps';
import { useQuery } from '@tanstack/react-query';

import { estimateUnlockAndCrosschainSwap } from '~/core/raps/unlockAndCrosschainSwap';
import { estimateUnlockAndSwap } from '~/core/raps/unlockAndSwap';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { gasUnits } from '~/core/references/gasUnits';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';

// ///////////////////////////////////////////////
// Query Types

export type EstimateSwapGasLimitResponse = {
  gasLimit: string;
};

export type EstimateSwapGasLimitArgs = {
  chainId: ChainId;
  quote?: Quote | CrosschainQuote | QuoteError;
  assetToSell?: ParsedSearchAsset;
  assetToBuy?: ParsedSearchAsset;
};

// ///////////////////////////////////////////////
// Query Key

const estimateSwapGasLimitQueryKey = ({
  chainId,
  quote,
  assetToSell,
  assetToBuy,
}: EstimateSwapGasLimitArgs) =>
  createQueryKey(
    'estimateSwapGasLimit',
    { chainId, quote, assetToSell, assetToBuy },
    { persisterVersion: 1 },
  );

type EstimateSwapGasLimitQueryKey = ReturnType<
  typeof estimateSwapGasLimitQueryKey
>;

// ///////////////////////////////////////////////
// Query Function

async function estimateSwapGasLimitQueryFunction({
  queryKey: [{ chainId, quote, assetToSell, assetToBuy }],
}: QueryFunctionArgs<typeof estimateSwapGasLimitQueryKey>) {
  if (!quote || (quote as QuoteError).error || !assetToSell || !assetToBuy) {
    return gasUnits.basic_swap[chainId];
  }
  const q = quote as Quote | CrosschainQuote;
  const gasLimit =
    q.swapType === SwapType.crossChain
      ? await estimateUnlockAndCrosschainSwap({
          chainId,
          quote: q as CrosschainQuote,
          sellAmount: q.sellAmount.toString(),
          assetToSell,
        })
      : await estimateUnlockAndSwap({
          chainId,
          quote: q as Quote,
          sellAmount: q.sellAmount.toString(),
          assetToSell,
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
  { chainId, quote, assetToSell, assetToBuy }: EstimateSwapGasLimitArgs,
  config: QueryConfig<
    EstimateSwapGasLimitResult,
    Error,
    EstimateSwapGasLimitResult,
    EstimateSwapGasLimitQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    estimateSwapGasLimitQueryKey({
      chainId,
      quote,
      assetToSell,
      assetToBuy,
    }),
    estimateSwapGasLimitQueryFunction,
    config,
  );
}

// ///////////////////////////////////////////////
// Query Hook

export function useEstimateSwapGasLimit(
  { chainId, quote, assetToSell, assetToBuy }: EstimateSwapGasLimitArgs,
  config: QueryConfig<
    EstimateSwapGasLimitResult,
    Error,
    EstimateSwapGasLimitResult,
    EstimateSwapGasLimitQueryKey
  > = {},
) {
  return useQuery(
    estimateSwapGasLimitQueryKey({
      chainId,
      quote,
      assetToSell,
      assetToBuy,
    }),
    estimateSwapGasLimitQueryFunction,
    { keepPreviousData: true, ...config },
  );
}
