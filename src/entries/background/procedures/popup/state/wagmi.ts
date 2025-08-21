import { os } from '@orpc/server';
import z from 'zod';

import { useNetworkStore } from '~/core/state/networks/networks';
import { updateWagmiConfig } from '~/core/wagmi';

const updateClientHandler = os.output(z.void()).handler(async () => {
  const activeChains = useNetworkStore.getState().getAllActiveRpcChains();
  updateWagmiConfig(activeChains);
});

export const wagmiRouter = {
  updateClient: updateClientHandler,
};
