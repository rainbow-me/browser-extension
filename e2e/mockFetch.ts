import { Hex, sha256 } from 'viem';

import { normalizeSwapUrlForMock } from './swapQuoteMockUtils';

export function mockFetch() {
  const nativeFetch = window.fetch;
  window.fetch = async function mockedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ) {
    if (input instanceof Request || !URL.canParse(input))
      return nativeFetch(input, init);

    const url = new URL(input);

    if (url.hostname === 'swap.p.rainbow.me') {
      const normalizedHref = normalizeSwapUrlForMock(url);
      const hash = sha256(normalizedHref as Hex);

      try {
        const response = await import(`./mocks/swap_quotes/${hash}.json`);

        if (!response)
          throw new Error('no response for request', {
            cause: { url: url.href, hash },
          });

        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        console.error('Mock not found for swap URL:', url.href);
        if (normalizedHref !== url.href) {
          console.error('Normalized URL for mock lookup:', normalizedHref);
        }
        console.error('Expected hash:', hash);
        // Return error response so the UI shows a meaningful state
        return new Response(
          JSON.stringify({ error: true, message: 'Mock not found' }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 404,
          },
        );
      }
    }

    // Mock meteorology API to return base fee matching Anvil's fixed base fee
    // Anvil runs with --block-base-fee-per-gas 100000000 (100 gwei in wei)
    if (
      url.hostname === 'metadata.p.rainbow.me' &&
      url.pathname.startsWith('/meteorology/v1/gas/')
    ) {
      const mockResponse = {
        data: {
          baseFeeSuggestion: '100000000',
          baseFeeTrend: 0,
          blocksToConfirmationByBaseFee: {
            '4': '1',
            '8': '1',
            '40': '1',
            '120': '1',
            '240': '1',
          },
          blocksToConfirmationByPriorityFee: {
            '1': '1',
            '2': '1',
            '3': '1',
            '4': '1',
          },
          currentBaseFee: '100000000', // Matches Anvil's --block-base-fee-per-gas
          maxPriorityFeeSuggestions: {
            fast: '2000000000',
            normal: '1000000000',
            urgent: '3000000000',
          },
          secondsPerNewBlock: 12,
          meta: {
            blockNumber: 0,
            provider: 'anvil',
          },
        },
        meta: {
          feeType: 'eip1559',
          blockNumber: '0',
          provider: 'anvil',
        },
      };

      return new Response(JSON.stringify(mockResponse), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return nativeFetch(input, init);
  };
}
