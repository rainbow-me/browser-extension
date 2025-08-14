import { Hex, sha256 } from 'viem';

interface MockService {
  hostname: string;
  getFilenameFromUrl: (url: URL) => string;
  getMockPath: (filename: string) => string;
  logPrefix: string;
}

const MOCK_SERVICES: MockService[] = [
  {
    hostname: 'swap.p.rainbow.me',
    getFilenameFromUrl: (url: URL) => `${sha256(url.href as Hex)}.json`,
    getMockPath: (filename: string) => `./mocks/swap_quotes/${filename}`,
    logPrefix: 'swap',
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
      console.log('Canonical URL for hashing:', canonical);
      return `${sha256(canonical as Hex)}.json`;
    },
    getMockPath: (filename: string) => `./mocks/user_assets/${filename}`,
    logPrefix: 'user assets',
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
      const mockPath = mockService.getMockPath(fileName);
      console.log(`Looking for mock file: ${mockPath}`);

      try {
        // Dynamic import with explicit path for webpack to bundle
        const mockData = await import(
          /* webpackMode: "eager" */
          /* webpackInclude: /\.json$/ */
          `${mockPath}`
        );
        console.log(
          `Mock response for ${mockService.logPrefix} loaded from: ${mockPath}`,
        );
        return new Response(JSON.stringify(mockData.default || mockData), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error(
          `Failed to load mock for ${mockService.logPrefix} at path: ${mockPath}`,
          error,
        );

        // For debugging: log what we tried to load
        console.log('Attempted to load:', {
          fileName,
          mockPath,
          canonicalHash: fileName.replace('.json', ''),
        });

        throw new Error(`No mock response found for ${mockService.logPrefix}`, {
          cause: { url: url.href, mockPath },
        });
      }
    }

    return nativeFetch(input, init);
  };
}
