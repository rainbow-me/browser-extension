import * as React from 'react';
import { Address } from 'wagmi';

import { useAppSessionsStore } from '~/core/state';

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
    },
    [host, updateSessionAddress],
  );

  const updateAppSessionChainId = React.useCallback(
    (chainId: number) => {
      updateSessionChainId({ host, chainId });
    },
    [host, updateSessionChainId],
  );

  const appSession = React.useMemo(
    () => appSessions[host],
    [appSessions, host],
  );

  const disconnectAppSession = React.useCallback(
    () => removeSession({ host }),
    [host, removeSession],
  );

  return {
    updateAppSessionAddress,
    updateAppSessionChainId,
    disconnectAppSession,
    appSession,
  };
}
