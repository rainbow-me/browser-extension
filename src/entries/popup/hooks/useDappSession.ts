import * as React from 'react';
import { Address } from 'wagmi';

import { useAppSessionsStore } from '~/core/state';

export function useDappSession({ host }: { host: string }) {
  const { updateSessionAddress, updateSessionChainId } = useAppSessionsStore();

  const updateDappSessionAddress = React.useCallback(
    (address: Address) => {
      updateSessionAddress({ host, address });
    },
    [host, updateSessionAddress],
  );

  const updateDappSessionChainId = React.useCallback(
    (chainId: number) => {
      updateSessionChainId({ host, chainId });
    },
    [host, updateSessionChainId],
  );

  return { updateDappSessionAddress, updateDappSessionChainId };
}
