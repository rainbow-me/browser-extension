import { Chain, PublicClient, createPublicClient, http } from 'viem';

import { useNetworkStore } from '~/core/state/networks/networks';

import { handleRpcUrl } from './clientRpc';

const clientRegistry = new Map<number, PublicClient>();

export function createViemClient(chain: Chain): PublicClient {
  const rpcUrl = handleRpcUrl(chain);
  return createPublicClient({ chain, transport: http(rpcUrl) });
}

export function getViemClient({
  chainId: _clientId,
}: { chainId?: number } = {}): PublicClient {
  let chainId = _clientId;
  if (!chainId) {
    const chains = useNetworkStore.getState().getAllActiveRpcChains();
    chainId = chains[0]?.id || 1;
  }
  let client = clientRegistry.get(chainId);
  if (!client) {
    const chains = useNetworkStore.getState().getAllActiveRpcChains();
    const chain = chains.find((c) => c.id === chainId);
    if (!chain) throw new Error(`Chain ${chainId} not found`);
    client = createViemClient(chain);
    clientRegistry.set(chainId, client);
  }
  return client;
}

export function updateViemClients(chains: Chain[]): void {
  clientRegistry.clear();
  chains.forEach((chain) =>
    clientRegistry.set(chain.id, createViemClient(chain)),
  );
}

export function getAvailableChains(): Chain[] {
  return useNetworkStore.getState().getAllActiveRpcChains();
}

export function clearClientRegistry(): void {
  clientRegistry.clear();
}
