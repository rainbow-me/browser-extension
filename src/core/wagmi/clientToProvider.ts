import { Provider } from '@ethersproject/providers';
import { getClient } from '@wagmi/core';
import { providers } from 'ethers';
import type { Chain, Client, Transport } from 'viem';
import { mainnet, optimism } from 'viem/chains';

import { chainHardhat, chainHardhatOptimism } from '../types/chains';

import { wagmiConfig } from '.';

const IS_TESTING = process.env.IS_TESTING === 'true';

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
  const internalChainId = (() => {
    if (IS_TESTING) {
      if (chainId === mainnet.id) return chainHardhat.id;
      if (chainId === optimism.id) return chainHardhatOptimism.id;
    }
    return chainId;
  })();

  const client = getClient(wagmiConfig, { chainId: internalChainId }) as Client<
    Transport,
    Chain
  >;
  return clientToProvider(client);
}
