/**
 * Shared constants and normalization for swap quote mock URLs.
 * Used by fetchResponses.ts (mock regeneration) and mockFetch.ts (runtime lookup)
 * so both compute the same canonical hash for mock file storage/lookup.
 */
export const LARGE_SWAP_SELL_AMOUNT = '10000000000000000000000';
export const FALLBACK_SWAP_SELL_AMOUNT = '1000000000000000000';

/**
 * Normalizes a swap URL for mock hashing. Large sell amounts are replaced with
 * the fallback so one mock file can serve both "large" and "fallback" requests.
 * Always returns canonical URL string (new URL(...).href) for consistent hashing.
 */
export function normalizeSwapUrlForMock(url: string | URL): string {
  const urlObj = typeof url === 'string' ? new URL(url) : url;
  const sellAmount = urlObj.searchParams.get('sellAmount');
  if (sellAmount !== LARGE_SWAP_SELL_AMOUNT) return urlObj.href;

  const normalized = new URL(urlObj.href);
  normalized.searchParams.set('sellAmount', FALLBACK_SWAP_SELL_AMOUNT);
  return normalized.href;
}
