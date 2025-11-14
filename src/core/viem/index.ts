import { Chain } from 'viem';

import { getAvailableChains, updateViemClients } from './clients';

export function updateViemClientsWrapper(chains: Chain[]): void {
  updateViemClients(chains);
}

export { getAvailableChains };
