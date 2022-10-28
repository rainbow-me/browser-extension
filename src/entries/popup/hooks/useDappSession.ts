import * as React from 'react';

import { useDappSessionsStore } from '~/core/state';
import { EthereumAddress } from '~/core/state/dappSessions';

export function useDappSession({ host }: { host: string }) {
  const { updateSessionAddress, updateSessionChainId } = useDappSessionsStore();

  const updateDappSessionAddress = React.useCallback(
    (address: EthereumAddress) => {
      updateSessionAddress(host, address);
    },
    [host, updateSessionAddress],
  );

  const updateDappSessionChainId = React.useCallback(
    (chainId: number) => {
      updateSessionChainId(host, chainId);
    },
    [host, updateSessionChainId],
  );

  return { updateDappSessionAddress, updateDappSessionChainId };
}
