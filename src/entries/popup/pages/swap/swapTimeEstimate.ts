import {
  CrosschainQuote,
  Quote,
  QuoteError,
  configureSDK,
} from '@rainbow-me/swaps';

import {
  getCrossChainTimeEstimate,
  getQuoteServiceTime,
} from '~/core/utils/swaps';

const IS_TESTING = process.env.IS_TESTING === 'true';

IS_TESTING && configureSDK({ apiBaseUrl: 'http://127.0.0.1:3001' });

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
