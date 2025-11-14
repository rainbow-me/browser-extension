import { os } from '@orpc/server';
import z from 'zod';

import { useNetworkStore } from '~/core/state/networks/networks';
import { updateViemClientsWrapper } from '~/core/viem';

const updateClientHandler = os.output(z.void()).handler(async () => {
  const activeChains = useNetworkStore.getState().getAllActiveRpcChains();
  updateViemClientsWrapper(activeChains);
});

export const viemRouter = {
  updateClient: updateClientHandler,
};
