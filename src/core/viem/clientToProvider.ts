import { Provider } from '@ethersproject/providers';
import { providers } from 'ethers';
import type { PublicClient } from 'viem';

import { RainbowError } from '~/logger';

import { handleRpcUrl } from './clientRpc';
import { getViemClient } from './clients';

export function clientToProvider(client: PublicClient): Provider {
  const { chain } = client;
  if (!chain) {
    throw new RainbowError('Chain not found');
  }
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  // Use handleRpcUrl to get the RPC URL from the chain
  const rpcUrl = handleRpcUrl(chain);
  return new providers.JsonRpcProvider(rpcUrl, network) as Provider;
}

export function clientToBatchedProvider(client: PublicClient): Provider {
  const { chain } = client;
  if (!chain) {
    throw new RainbowError('Chain not found');
  }
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  // Use handleRpcUrl to get the RPC URL from the chain
  const rpcUrl = handleRpcUrl(chain);
  return new providers.JsonRpcBatchProvider(rpcUrl, network);
}

export function getProvider({ chainId }: { chainId?: number } = {}): Provider {
  try {
    return clientToProvider(getViemClient({ chainId }));
  } catch (error) {
    throw new RainbowError('Failed to create provider', {
      cause: error instanceof Error ? error : new Error(String(error)),
    });
  }
}

export function getBatchedProvider({
  chainId,
}: { chainId?: number } = {}): Provider {
  try {
    return clientToBatchedProvider(getViemClient({ chainId }));
  } catch (error) {
    throw new RainbowError('Failed to create batched provider', {
      cause: error instanceof Error ? error : new Error(String(error)),
    });
  }
}
