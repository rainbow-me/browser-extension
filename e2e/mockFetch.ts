import { Hex, sha256 } from 'viem';

// Use webpack's require.context to include mock files at build time
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requireAny: any = require as any;
const userAssetMocksContext = requireAny.context(
  './mocks/user_assets',
  false,
  /\.json$/,
);
const swapQuoteMocksContext = requireAny.context(
  './mocks/swap_quotes',
  false,
  /\.json$/,
);

interface MockService {
  hostname: string;
  getFilenameFromUrl: (url: URL) => string;
  logPrefix: string;
  context: ReturnType<typeof requireAny.context>;
}

const MOCK_SERVICES: MockService[] = [
  {
    hostname: 'swap.p.rainbow.me',
    getFilenameFromUrl: (url: URL) => `${sha256(url.href as Hex)}.json`,
    logPrefix: 'swap',
    context: swapQuoteMocksContext,
  },
  {
    hostname: 'addys.p.rainbow.me',
    getFilenameFromUrl: (url: URL) => {
      // Normalize to match generator: lowercase address and keep only currency param
      // Expected pathname: /v3/<chains>/<address>/assets/
      const parts = url.pathname.split('/').filter(Boolean);
      // parts[0] === 'v3', parts[1] === chains, parts[2] === address
      const chains = parts[1] || '';
      const addressLower = (parts[2] || '').toLowerCase();
      const currency = (
        url.searchParams.get('currency') || 'usd'
      ).toLowerCase();
      const canonical = `${url.origin}/v3/${chains}/${addressLower}/assets/?currency=${currency}`;
      return `${sha256(canonical as Hex)}.json`;
    },
    logPrefix: 'user assets',
    context: userAssetMocksContext,
  },
];

export function mockFetch() {
  const nativeFetch = window.fetch;
  window.fetch = async function mockedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ) {
    if (input instanceof Request || !URL.canParse(input))
      return nativeFetch(input, init);

    const url = new URL(input);

    const mockService = MOCK_SERVICES.find(
      (service) => url.hostname === service.hostname,
    );

    if (mockService) {
      console.log(`Intercepting ${mockService.logPrefix} request:`, {
        url: url.href,
        params: Object.fromEntries(url.searchParams),
      });

      const fileName = mockService.getFilenameFromUrl(url);
      const key = `./${fileName}`;
      console.log(`Looking for mock file: ${key}`);

      try {
        const response = mockService.context(key);
        console.log(
          `Mock response for ${mockService.logPrefix} loaded from: ${key}`,
        );
        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error(
          `Failed to load mock for ${mockService.logPrefix} at path: ${key}`,
          error,
        );

        // Log available mocks for debugging
        const available =
          typeof mockService.context.keys === 'function'
            ? mockService.context.keys()
            : [];
        console.log(`Available ${mockService.logPrefix} mocks:`, available);

        throw new Error(`No mock response found for ${mockService.logPrefix}`, {
          cause: { url: url.href, key },
        });
      }
    }

    return nativeFetch(input, init);
  };
}
