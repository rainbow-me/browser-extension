import { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';

import {
  getCrossChainTimeEstimate,
  getQuoteServiceTime,
} from '~/core/utils/swaps';

export interface SwapTimeEstimate {
  isLongWait: boolean;
  timeEstimate?: number;
  timeEstimateDisplay: string;
}

export function getSwapTimeEstimate(
  quote: Quote | CrosschainQuote | QuoteError | undefined,
) {
  if (!quote || 'error' in quote) return null;
  const serviceTime = getQuoteServiceTime({ quote });
  if (!serviceTime) return null;
  const timeEstimate = getCrossChainTimeEstimate({ serviceTime });
  return timeEstimate;
}
