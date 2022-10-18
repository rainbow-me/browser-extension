import * as React from 'react';
import { useAccount, useConnect } from 'wagmi';

/**
 * Since we don't want to opt-in to the default wagmi
 * behaviour where an account is not "connected" to the connector
 * by default and we are a BX not a Dapp, we want to forcefully
 * connect to the connector when the BX boots up as we know
 * we're already going to be connected to an account.
 */
export function useForceConnect() {
  const { isConnected } = useAccount();
  const { connect, connectors, isError, error } = useConnect();

  React.useEffect(() => {
    if (!isConnected) {
      connect({ connector: connectors[0] });
    }
  }, [connect, connectors, isConnected]);

  return { error, isConnected, isError };
}
