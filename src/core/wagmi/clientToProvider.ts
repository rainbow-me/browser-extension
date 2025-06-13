import { Provider } from '@ethersproject/providers';
import { getClient, getPublicClient } from '@wagmi/core';
import { providers } from 'ethers';
import {
  type Chain,
  type Client,
  PublicClient,
  type Transport,
  createPublicClient,
  http,
} from 'viem';

import { wagmiConfig } from '.';

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

export function clientToBatchedProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  return new providers.JsonRpcBatchProvider(transport.url, network);
}

export function getProviderViem({
  chainId,
}: { chainId?: number } = {}): PublicClient {
  const client = getPublicClient(wagmiConfig, { chainId });
  if (client) {
    return client;
  }

  const rpcUrl = wagmiConfig.chains.find((chain) => chain.id === chainId)
    ?.rpcUrls.default.http[0];

  const newClient = createPublicClient({
    transport: http(rpcUrl),
  });

  return newClient;
}

/** Action to convert a viem Public Client to an ethers.js Provider. */
export function getProvider({ chainId }: { chainId?: number } = {}) {
  const client = getClient(wagmiConfig, { chainId }) as Client<
    Transport,
    Chain
  >;
  return clientToProvider(client);
}

/** Action to convert a viem Public Client to an ethers.js Batched Provider. */
export function getBatchedProvider({ chainId }: { chainId?: number } = {}) {
  const client = getClient(wagmiConfig, { chainId }) as Client<
    Transport,
    Chain
  >;
  return clientToBatchedProvider(client);
}
