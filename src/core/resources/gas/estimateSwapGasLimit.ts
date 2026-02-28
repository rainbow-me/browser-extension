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
import { useNetworkStore } from '~/core/state/networks/networks';
import { ParsedAsset, ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isQuoteError } from '~/core/utils/swaps';

// ///////////////////////////////////////////////
// Query Types

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type EstimateSwapGasLimitResponse = {
  gasLimit: bigint;
};

type EstimateSwapGasLimitArgs = {
  chainId: ChainId;
  quote?: Quote | CrosschainQuote | QuoteError;
  assetToSell?: ParsedSearchAsset | ParsedAsset;
  assetToBuy?: ParsedSearchAsset | ParsedAsset;
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
  if (!quote || isQuoteError(quote) || !assetToSell || !assetToBuy) {
    const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);
    return BigInt(chainGasUnits.basic.swap);
  }
  const gasLimit =
    quote.swapType === SwapType.crossChain
      ? await estimateUnlockAndCrosschainSwap({
          chainId,
          quote: quote as CrosschainQuote,
          sellAmount: quote.sellAmount.toString(),
          assetToBuy,
          assetToSell,
        })
      : await estimateUnlockAndSwap({
          chainId,
          quote: quote as Quote,
          sellAmount: quote.sellAmount.toString(),
          assetToBuy,
          assetToSell,
        });

  if (!gasLimit) {
    const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);
    return BigInt(chainGasUnits.basic.swap);
  }
  return BigInt(gasLimit);
}

type EstimateSwapGasLimitResult = QueryFunctionResult<
  typeof estimateSwapGasLimitQueryFunction
>;

// ///////////////////////////////////////////////
// Query Fetcher

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchEstimateSwapGasLimit(
  { chainId, quote, assetToSell, assetToBuy }: EstimateSwapGasLimitArgs,
  config: QueryConfig<
    EstimateSwapGasLimitResult,
    Error,
    EstimateSwapGasLimitResult,
    EstimateSwapGasLimitQueryKey
  > = {},
) {
  return await queryClient.fetchQuery({
    queryKey: estimateSwapGasLimitQueryKey({
      chainId,
      quote,
      assetToSell,
      assetToBuy,
    }),
    queryFn: estimateSwapGasLimitQueryFunction,
    ...config,
  });
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
  return useQuery({
    queryKey: estimateSwapGasLimitQueryKey({
      chainId,
      quote,
      assetToSell,
      assetToBuy,
    }),
    queryFn: estimateSwapGasLimitQueryFunction,
    ...config,
    placeholderData: (previousData) => previousData,
  });
}
