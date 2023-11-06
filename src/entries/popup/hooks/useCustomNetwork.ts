import { useEffect, useMemo } from 'react';

import { initializeMessenger } from '~/core/messengers';
import { useCustomRPCsStore } from '~/core/state/customRPC';

import usePrevious from './usePrevious';

const backgroundMessenger = initializeMessenger({ connect: 'background' });

export const useCustomNetwork = () => {
  const { customChains } = useCustomRPCsStore();
  const chains = useMemo(
    () =>
      Object.values(customChains)
        .map((customChain) =>
          customChain.chains.find(
            (chain) =>
              chain.rpcUrls.default.http[0] === customChain.activeRpcUrl,
          ),
        )
        .filter(Boolean),
    [customChains],
  );
  const prevChains = usePrevious(chains);

  useEffect(() => {
    if (prevChains?.length && prevChains?.length !== chains.length) {
      backgroundMessenger.send('rainbow_updateWagmiClient', null);
    }
  }, [chains.length, prevChains?.length]);

  return {
    customChains: chains,
  };
};
