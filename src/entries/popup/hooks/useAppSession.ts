import * as React from 'react';
import { Address } from 'wagmi';

import { initializeMessenger } from '~/core/messengers';
import { useAppSessionsStore } from '~/core/state';

const messenger = initializeMessenger({ connect: 'inpage' });

export function useAppSession({ host }: { host: string }) {
  const {
    removeAppSession,
    updateActiveSessionChainId,
    updateActiveSession,
    appSessions,
    addSession,
    getActiveSession,
  } = useAppSessionsStore();

  const activeSession = getActiveSession({ host });

  const updateAppSessionAddress = React.useCallback(
    (address: Address) => {
      updateActiveSession({ host, address });
      messenger.send(`accountsChanged:${host}`, [address]);
    },
    [host, updateActiveSession],
  );

  const updateAppSessionChainId = React.useCallback(
    (chainId: number) => {
      updateActiveSessionChainId({ host, chainId });
      messenger.send(`chainChanged:${host}`, chainId);
    },
    [host, updateActiveSessionChainId],
  );

  const appSession = React.useMemo(
    () => appSessions[host],
    [appSessions, host],
  );

  const disconnectAppSession = React.useCallback(() => {
    removeAppSession({ host });
    messenger.send(`disconnect:${host}`, null);
  }, [host, removeAppSession]);

  return {
    addSession,
    updateAppSessionAddress,
    updateAppSessionChainId,
    disconnectAppSession,
    appSession,
    activeSession,
  };
}
