import { QuoteError } from '@rainbow-me/swaps';

import { analytics } from '~/analytics';
import { EventProperties } from '~/analytics/event';
import { ParsedAsset } from '~/core/types/assets';

let lastParams: EventProperties[typeof analytics.event.swapQuoteFailed];
export function analyticsTrackQuoteFailed(
  quote: QuoteError | null,
  {
    inputAsset,
    outputAsset,
    inputAmount,
    outputAmount,
  }: {
    inputAsset: ParsedAsset | null;
    outputAsset: ParsedAsset | null;
    inputAmount: string | undefined;
    outputAmount: string | undefined;
  },
) {
  'worklet';
  // we are tracking 'Insufficient funds' 'Out of gas' 'No routes found' and 'No quotes found'
  if (!quote || !inputAsset || !outputAsset || !inputAmount) return;

  if (
    lastParams &&
    quote.error_code === lastParams.error_code &&
    inputAmount === lastParams.inputAmount &&
    outputAmount === lastParams.outputAmount &&
    inputAsset.address === lastParams.inputAsset.address &&
    outputAsset.address === lastParams.outputAsset.address
  )
    return;

  const params = {
    error_code: quote.error_code,
    reason: quote.message,
    inputAsset: {
      address: inputAsset.address,
      chainId: inputAsset.chainId,
      symbol: inputAsset.symbol,
    },
    outputAsset: {
      address: outputAsset.address,
      chainId: outputAsset.chainId,
      symbol: outputAsset.symbol,
    },
    inputAmount,
    outputAmount,
  };
  lastParams = params;
  analytics.track(analytics.event.swapQuoteFailed, params);
}
