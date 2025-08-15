import { Hex, sha256 } from 'viem';

// Type for JSON modules that may have a default export
type MockData = {
  default?: unknown;
  [key: string]: unknown;
};

// Type declarations for Webpack's require.context
declare const require: {
  context(
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp,
  ): {
    keys(): string[];
    (id: string): MockData;
  };
};

interface MockService {
  hostname: string;
  getFilenameFromUrl: (url: URL) => {
    fileName: string;
    canonicalUrl: string;
  };
  getMockPath: (filename: string) => string;
  logPrefix: string;
}

// Webpack needs explicit imports to bundle JSON files
// We'll create a context for each mock directory
const swapMocksContext = require.context(
  './mocks/swap_quotes',
  false,
  /\.json$/,
);

const userAssetsMocksContext = require.context(
  './mocks/user_assets',
  false,
  /\.json$/,
);

// Create maps of available mocks
const swapMocks = new Map<string, MockData>();
const userAssetsMocks = new Map<string, MockData>();

// Load all mocks at initialization
try {
  const swapKeys = swapMocksContext.keys();
  console.log(
    `[MockFetch] Found ${swapKeys.length} swap mock files:`,
    swapKeys.slice(0, 5),
  );
  swapKeys.forEach((key: string) => {
    const fileName = key.replace('./', '');
    swapMocks.set(fileName, swapMocksContext(key));
  });
  console.log(`[MockFetch] Loaded ${swapMocks.size} swap quote mocks`);
} catch (e) {
  console.error('[MockFetch] Failed to load swap mocks:', e);
}

try {
  const userKeys = userAssetsMocksContext.keys();
  console.log(
    `[MockFetch] Found ${userKeys.length} user asset mock files:`,
    userKeys.slice(0, 5),
  );
  userKeys.forEach((key: string) => {
    const fileName = key.replace('./', '');
    userAssetsMocks.set(fileName, userAssetsMocksContext(key));
  });
  console.log(`[MockFetch] Loaded ${userAssetsMocks.size} user asset mocks`);
  // Log first few entries to verify they're loaded
  const firstEntries = Array.from(userAssetsMocks.entries()).slice(0, 3);
  console.log(
    '[MockFetch] Sample user asset mocks loaded:',
    firstEntries.map(([k, v]) => [k, !!v]),
  );
} catch (e) {
  console.error('[MockFetch] Failed to load user asset mocks:', e);
}

const MOCK_SERVICES: MockService[] = [
  {
    hostname: 'swap.p.rainbow.me',
    getFilenameFromUrl: (url: URL) => ({
      canonicalUrl: url.href,
      fileName: `${sha256(url.href as Hex)}.json`,
    }),
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

      // Handle the case where there's no address (double slash in URL)
      // This happens when the wallet hasn't loaded yet
      if (!parts[2] || parts[2] === 'assets') {
        // No address case: /v3/chains//assets/
        const canonicalUrl = `${url.origin}/v3/${chains}//assets/?currency=${currency}`;
        console.log('Canonical URL for hashing (no address):', canonicalUrl);
        return {
          canonicalUrl,
          fileName: `${sha256(canonicalUrl as Hex)}.json`,
        };
      }

      // Normal case with address
      const canonicalUrl = `${url.origin}/v3/${chains}/${addressLower}/assets/?currency=${currency}`;
      console.log('Canonical URL for hashing:', canonicalUrl);
      return {
        canonicalUrl,
        fileName: `${sha256(canonicalUrl as Hex)}.json`,
      };
    },
    getMockPath: (filename: string) => `./mocks/user_assets/${filename}`,
    logPrefix: 'user assets',
  },
];

export function mockFetch() {
  console.log('[MockFetch] Initializing mock fetch system', {
    IS_TESTING: process.env.IS_TESTING,
    NODE_ENV: process.env.NODE_ENV,
    availableServices: MOCK_SERVICES.map((s) => s.hostname),
  });

  const nativeFetch = globalThis.fetch;
  if (!nativeFetch) {
    throw new Error('[MockFetch] Fetch API is unavailable in this environment');
  }
  globalThis.fetch = async function mockedFetch(
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
      console.log(
        `[MockFetch] Intercepting ${mockService.logPrefix} request:`,
        {
          url: url.href,
          params: Object.fromEntries(url.searchParams),
          pathname: url.pathname,
        },
      );

      const { fileName, canonicalUrl } = mockService.getFilenameFromUrl(url);
      const hash = fileName.replace('.json', '');
      const mockPath = mockService.getMockPath(fileName);
      console.log(`[MockFetch] Looking for mock file:`, {
        mockPath,
        fileName,
        canonicalUrl,
        hash,
      });

      try {
        console.log('[MockFetch] Looking up pre-loaded mock...');

        // Get the mock from our pre-loaded maps
        let mockData: MockData | undefined;
        if (mockService.hostname === 'swap.p.rainbow.me') {
          mockData = swapMocks.get(fileName);
        } else if (mockService.hostname === 'addys.p.rainbow.me') {
          mockData = userAssetsMocks.get(fileName);
        }

        if (!mockData) {
          throw new Error(`Mock not found in pre-loaded maps: ${fileName}`);
        }

        console.log(
          `[MockFetch] Mock response for ${mockService.logPrefix} loaded successfully`,
          {
            hasDefault: !!mockData.default,
            hasData: !!mockData,
            dataKeys: mockData.default
              ? Object.keys(mockData.default as Record<string, unknown>).slice(
                  0,
                  5,
                )
              : Object.keys(mockData).slice(0, 5),
          },
        );
        return new Response(JSON.stringify(mockData.default || mockData), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error(`[MockFetch] Failed to load mock:`, {
          service: mockService.logPrefix,
          mockPath,
          fileName,
          canonicalUrl,
          hash,
          error: error instanceof Error ? error.message : error,
          stack:
            error instanceof Error
              ? error.stack?.split('\n').slice(0, 3)
              : undefined,
        });
        const errorMessage = `
❌ Mock file not found for ${mockService.logPrefix}

Requested URL: ${url.href}
Canonical URL: ${canonicalUrl}
Expected mock file: ${mockPath}
Computed hash: ${hash}

To fix this:
1. Ensure the mock file exists at: e2e/${mockPath}
2. If missing, run: npx tsx e2e/generateUserAssetMocks.ts
3. Rebuild with IS_TESTING=true

Debug info:
- Canonical URL used for hashing: See console log above
- Mock filename: ${fileName}
        `.trim();

        console.error(errorMessage);

        throw new Error(`Mock not found: ${mockService.logPrefix}`, {
          cause: {
            url: url.href,
            mockPath,
            hash: fileName.replace('.json', ''),
            hint: 'Run mock generation script and rebuild',
          },
        });
      }
    }

    return nativeFetch(input, init);
  };
}
