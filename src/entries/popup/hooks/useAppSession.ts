import * as React from 'react';
import { Address } from 'wagmi';

import { initializeMessenger } from '~/core/messengers';
import { useAppSessionsStore } from '~/core/state';
import { isLowerCaseMatch } from '~/core/utils/strings';

const messenger = initializeMessenger({ connect: 'inpage' });

export function useAppSession({ host }: { host: string }) {
  const {
    removeAppSession,
    updateActiveSessionChainId: storeUpdateActiveSessionChainId,
    updateSessionChainId: storeUpdateSessionChainId,
    updateActiveSession,
    appSessions,
    addSession,
    getActiveSession,
  } = useAppSessionsStore();

  const activeSession = getActiveSession({ host });

  const updateAppSessionAddress = React.useCallback(
    ({ address }: { address: Address }) => {
      updateActiveSession({ host, address });
      messenger.send(`accountsChanged:${host}`, address);
    },
    [host, updateActiveSession],
  );

  const updateAppSessionChainId = React.useCallback(
    (chainId: number) => {
      storeUpdateActiveSessionChainId({ host, chainId });
      messenger.send(`chainChanged:${host}`, chainId);
    },
    [host, storeUpdateActiveSessionChainId],
  );

  const updateActiveSessionChainId = React.useCallback(
    (chainId: number) => {
      storeUpdateActiveSessionChainId({ host, chainId });
      messenger.send(`chainChanged:${host}`, chainId);
    },
    [host, storeUpdateActiveSessionChainId],
  );

  const updateSessionChainId = React.useCallback(
    ({ address, chainId }: { address: Address; chainId: number }) => {
      storeUpdateSessionChainId({ host, address, chainId });
      if (isLowerCaseMatch(activeSession?.address, address)) {
        messenger.send(`chainChanged:${host}`, chainId);
      }
    },
    [activeSession?.address, host, storeUpdateSessionChainId],
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
    updateActiveSessionChainId,
    updateSessionChainId,
    updateAppSessionChainId,
    disconnectAppSession,
    appSession,
    activeSession,
  };
}
