import * as React from 'react';
import { Address } from 'wagmi';

import { initializeMessenger } from '~/core/messengers';
import { useAppSessionsStore } from '~/core/state';

const messenger = initializeMessenger({ connect: 'inpage' });

export function useAppSession({ host }: { host: string }) {
  const {
    updateSessionAddress,
    updateSessionChainId,
    removeSession,
    appSessions,
  } = useAppSessionsStore();

  const updateAppSessionAddress = React.useCallback(
    (address: Address) => {
      updateSessionAddress({ host, address });
      messenger.send(`accountsChanged:${host}`, [address]);
    },
    [host, updateSessionAddress],
  );

  const updateAppSessionChainId = React.useCallback(
    (chainId: number) => {
      updateSessionChainId({ host, chainId });
      messenger.send(`chainChanged:${host}`, chainId);
    },
    [host, updateSessionChainId],
  );

  const appSession = React.useMemo(
    () => appSessions[host],
    [appSessions, host],
  );

  const disconnectAppSession = React.useCallback(() => {
    removeSession({ host });
    messenger.send(`disconnect:${host}`, null);
  }, [host, removeSession]);

  return {
    updateAppSessionAddress,
    updateAppSessionChainId,
    disconnectAppSession,
    appSession,
  };
}
