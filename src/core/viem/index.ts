import { Chain } from 'viem';

import { handleRpcUrl } from './clientRpc';
import { getAvailableChains, updateViemClients } from './clients';

export const createChains = (chains: Chain[]): [Chain, ...Chain[]] => {
  return chains.map((chain) => {
    const rpcUrl = handleRpcUrl(chain);
    return {
      ...chain,
      rpcUrls: { default: { http: [rpcUrl] }, public: { http: [rpcUrl] } },
    } as Chain;
  }) as [Chain, ...Chain[]];
};

export function updateViemClientsWrapper(chains: Chain[]): void {
  updateViemClients(chains);
}

export { getAvailableChains };
