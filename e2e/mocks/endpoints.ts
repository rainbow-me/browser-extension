// Service configuration type
type ServiceConfig = {
  host: string;
  // Custom headers to add to requests (can use process.env directly)
  headers?: Record<string, string | undefined>;
  paths: Array<{
    pattern: RegExp;
    dir: string;
  }>;
};

// Map of endpoint patterns to their mock directories and header configuration
export const ENDPOINTS: Record<string, ServiceConfig> = {
  swap: {
    host: 'swap.p.rainbow.me',
    headers: {},
    paths: [
      // /swap/quote/
      // https://swap.p.rainbow.me/v1/quote?...  → e2e/mocks/swap/quote/<hash>.json
      {
        pattern: /^\/v1\/quote/,
        dir: 'swap/quote',
      },
      // /swap/slippage/
      // https://swap.p.rainbow.me/v1/slippage?...  → e2e/mocks/swap/slippage/<hash>.json
      {
        pattern: /^\/v1\/slippage/,
        dir: 'swap/slippage',
      },
    ],
  },
  addys: {
    // /addys/assets/
    // https://addys.p.rainbow.me/v3/<chains>/<address>/assets/?currency=usd
    host: 'addys.p.rainbow.me',
    headers: {
      Authorization: `Bearer ${process.env.ADDYS_API_KEY}`,
    },
    paths: [
      // /addys/summary/
      // https://addys.p.rainbow.me/v3/summary
      {
        pattern: /^\/v3\/summary$/,
        dir: 'addys/summary',
      },
      // /addys/assets/
      // https://addys.p.rainbow.me/v3/<chains>/<address>/assets/?currency=usd
      {
        pattern: /\/v3\/[^/]+\/[^/]+\/assets/,
        dir: 'addys/assets',
      },
    ],
  },
  metadata: {
    // GraphQL endpoint for ENS resolution and other metadata
    host: 'metadata.p.rainbow.me',
    headers: {},
    paths: [
      // /metadata/graphql/
      // https://metadata.p.rainbow.me/graphql  → e2e/mocks/metadata/graphql/<hash>.json
      {
        pattern: /^\/graphql/,
        dir: 'metadata/graphql',
      },
    ],
  },
};
