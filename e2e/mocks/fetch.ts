import { Hex, sha256 } from 'viem';

// Handle mocked services
const mockConfigs = [
  {
    service: 'swap',
    hostname: 'swap.p.rainbow.me',
    mockPath: 'swap/quotes',
  },
  {
    service: 'addys',
    hostname: 'addys.p.rainbow.me',
    path: '/assets',
    mockPath: 'addys/assets',
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

    const config = mockConfigs.find((c) => {
      if (url.hostname !== c.hostname) return false;
      if (c.path && !url.pathname.includes(c.path)) return false;
      return true;
    });

    if (config) {
      const hash = sha256(url.href as Hex);

      console.log(`Intercepting ${config.service} request:`, {
        url: url.href,
        hash,
      });

      const response = await import(`./${config.mockPath}/${hash}.json`);

      if (!response)
        throw new Error('no response for request', {
          cause: { url: url.href, hash },
        });

      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return nativeFetch(input, init);
  };
}
