import { useMemo } from 'react';

import { useRainbowChainsStore } from '~/core/state';

export const useRainbowChains = () => {
  const { rainbowChains } = useRainbowChainsStore();
  const chains = useMemo(
    () =>
      Object.values(rainbowChains)
        .map((rainbowChain) =>
          rainbowChain.chains.find(
            (chain) =>
              chain.rpcUrls.default.http[0] === rainbowChain.activeRpcUrl,
          ),
        )
        .filter(Boolean),
    [rainbowChains],
  );

  return {
    rainbowChains: chains,
  };
};
