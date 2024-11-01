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
      const hash = sha256(url.href as Hex);
      const response = await import(`./responses/${hash}.json`);

      if (!response)
        throw new Error('no response for request', {
          cause: { url: url.toString(), hash },
        });

      return Promise.resolve(response);
    }

    return nativeFetch(input, init);
  };
}
