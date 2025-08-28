import { HttpResponse, http } from 'msw';

// Mock swap quote response for ETH -> USDC (no allowance needed)
const mockSwapQuote = {
  sellTokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  buyTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  sellAmount: '1000000000000000000',
  buyAmount: '1800000000',
  value: '1000000000000000000',
  gas: '600000',
  to: '0xdef1abe32c034e558cdd535791643c58a13acc10',
  data: '0x0000',
  from: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  defaultGasLimit: '600000',
  swapType: 'normal',
  swapFee: '0',
  swapFeeInEth: '0',
  tradeAmountUSD: 1800,
  tradeFeeAmountUSD: 0,
  routes: [],
  allowanceTarget: '0x0000000000000000000000000000000000000000',
  allowanceNeeded: false,
  protocols: [{ name: 'UniswapV3', part: 100 }],
};

// Mock swap quote response for ENS -> USDC (allowance needed)
const mockSwapQuoteWithAllowance = {
  sellTokenAddress: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72', // ENS token address
  buyTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  sellAmount: '1000000000000000000',
  buyAmount: '1800000000',
  value: '0',
  gas: '600000',
  to: '0xdef1abe32c034e558cdd535791643c58a13acc10',
  data: '0x0000',
  from: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  defaultGasLimit: '600000',
  swapType: 'normal',
  swapFee: '0',
  swapFeeInEth: '0',
  tradeAmountUSD: 1800,
  tradeFeeAmountUSD: 0,
  routes: [],
  allowanceTarget: '0xdef1abe32c034e558cdd535791643c58a13acc10',
  allowanceNeeded: true,
  protocols: [{ name: 'UniswapV3', part: 100 }],
};

// Mock crosschain quote response for testing
const mockCrosschainQuote = {
  sellTokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  buyTokenAddress: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
  sellAmount: '1000000000000000000',
  buyAmount: '1800000000',
  value: '1000000000000000000',
  gas: '600000',
  to: '0xdef1abe32c034e558cdd535791643c58a13acc10',
  data: '0x0000',
  from: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
  defaultGasLimit: '600000',
  swapType: 'cross-chain',
  swapFee: '0',
  swapFeeInEth: '0',
  tradeAmountUSD: 1800,
  tradeFeeAmountUSD: 0,
  routes: [],
  allowanceTarget: '0x0000000000000000000000000000000000000000',
  protocols: [{ name: 'Socket', part: 100 }],
  chainId: 1,
  toChainId: 42161,
};

export const swapHandlers = [
  // Handle OPTIONS (CORS preflight) requests
  http.options('https://swap.p.rainbow.me/*', () => {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }),

  // Mock regular swap quotes
  http.get('https://swap.p.rainbow.me/v1/quote', ({ request }) => {
    const url = new URL(request.url);
    const bridgeVersion = url.searchParams.get('bridgeVersion');
    const sellToken = url.searchParams.get('sellToken');

    // Return crosschain quote if bridgeVersion is set
    if (bridgeVersion) {
      return HttpResponse.json(mockCrosschainQuote, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Return quote with allowance for ENS token
    if (sellToken === '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72') {
      return HttpResponse.json(mockSwapQuoteWithAllowance, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Return regular swap quote for ETH and other tokens
    return HttpResponse.json(mockSwapQuote, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }),

  // Also handle POST requests for quotes
  http.post('https://swap.p.rainbow.me/v1/quote', ({ request }) => {
    const url = new URL(request.url);
    const bridgeVersion = url.searchParams.get('bridgeVersion');
    const sellToken = url.searchParams.get('sellToken');

    // Return crosschain quote if bridgeVersion is set
    if (bridgeVersion) {
      return HttpResponse.json(mockCrosschainQuote, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Return quote with allowance for ENS token
    if (sellToken === '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72') {
      return HttpResponse.json(mockSwapQuoteWithAllowance, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Return regular swap quote for ETH and other tokens
    return HttpResponse.json(mockSwapQuote, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }),
];
