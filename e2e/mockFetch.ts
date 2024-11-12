import { Hex, sha256 } from 'viem';

import { AddressAssetsReceivedMessage } from '~/core/types/refraction';

export function mockFetch() {
  const nativeFetch = window.fetch;
  window.fetch = async function mockedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ) {
    if (input instanceof Request || !URL.canParse(input))
      return nativeFetch(input, init);

    const url = new URL(input);

    // if (
    //   url.hostname === 'addys.p.rainbow.me' &&
    //   url.pathname.endsWith('/assets')
    // ) {
    //   const response = await nativeFetch(input, init);
    //   const data = (await response.json()) as AddressAssetsReceivedMessage;

    //   if (data.payload?.assets) {
    //     const eth = data.payload.assets.find((a) => a.asset.symbol === 'ETH');
    //     if (eth?.asset.price) eth.asset.price.value = 3267.8599999999988;
    //     console.log(eth);
    //   }
    //   return new Response(JSON.stringify(data), {
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    // }

    if (url.hostname === 'swap.p.rainbow.me') {
      const hash = sha256(url.href as Hex);
      const response = await import(`./mocks/swap_quotes/${hash}.json`);

      // fetch('http://127.0.0.1:8008/' + url.href);

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
