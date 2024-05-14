import { Provider } from '@ethersproject/providers';
import { getClient } from '@wagmi/core';
import { providers } from 'ethers';
import type { Chain, Client, Transport } from 'viem';

import { wagmiConfig } from '../utils/chains';

export function clientToProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  if (transport.type === 'fallback')
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<Transport>[]).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network),
      ),
    ) as Provider;
  return new providers.JsonRpcProvider(transport.url, network) as Provider;
}

/** Action to convert a viem Public Client to an ethers.js Provider. */
export function getProvider({ chainId }: { chainId?: number } = {}) {
  const client = getClient(wagmiConfig, { chainId }) as Client<
    Transport,
    Chain
  >;
  return clientToProvider(client);
}
