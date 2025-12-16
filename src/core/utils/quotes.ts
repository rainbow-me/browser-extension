import type { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';

import { isLowerCaseMatch } from './strings';

export function isQuoteError(data: unknown): data is QuoteError {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    (data as QuoteError).error === true &&
    typeof (data as QuoteError).message === 'string'
  );
}

export function isQuote(data: unknown): data is Quote {
  if (typeof data !== 'object' || data === null) return false;
  const q = data as Record<string, unknown>;
  return (
    !('error' in q && q.error === true) &&
    typeof q.from === 'string' &&
    typeof q.sellTokenAddress === 'string' &&
    typeof q.buyTokenAddress === 'string' &&
    typeof q.chainId === 'number'
  );
}

export function isCrosschainQuote(data: unknown): data is CrosschainQuote {
  return (
    isQuote(data) &&
    'routes' in data &&
    Array.isArray((data as CrosschainQuote).routes)
  );
}

const SUPPRESSED_QUOTE_ERRORS = new Set(['error parsing sellAmount']);

export function shouldSuppressQuoteError(message: string): boolean {
  return SUPPRESSED_QUOTE_ERRORS.has(message);
}

/**
 * Validates that all recipients in a crosschain quote match the expected recipient.
 * Security check to ensure the quote targets the correct destination address.
 */
export function crosschainQuoteTargetsRecipient(
  quote: CrosschainQuote,
  recipient: string,
): boolean {
  for (const route of quote.routes) {
    if (!isLowerCaseMatch(route.recipient, recipient)) {
      return false;
    }
    for (const userTx of route.userTxs) {
      if (!isLowerCaseMatch(userTx.recipient, recipient)) {
        return false;
      }
    }
  }
  if (quote.refuel && !isLowerCaseMatch(quote.refuel.recipient, recipient)) {
    return false;
  }
  return true;
}
