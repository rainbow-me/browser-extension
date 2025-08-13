import { Hex, sha256 } from 'viem';

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
      console.log('Intercepting swap request:', {
        url: url.href,
        params: Object.fromEntries(url.searchParams),
      });

      const hash = sha256(url.href as Hex);
      console.log('Looking for mock file with hash:', hash);

      const response = await import(`./swap/quotes/${hash}.json`);
      console.log('Mock response:', response);

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
