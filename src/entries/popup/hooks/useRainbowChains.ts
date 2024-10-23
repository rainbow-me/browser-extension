import { useMemo } from 'react';

import { useRainbowChainsStore } from '~/core/state';

export const useRainbowChains = () => {
  const rainbowChains = useRainbowChainsStore.use.rainbowChains();

  const chains = useMemo(() => {
    return Object.values(rainbowChains)
      .map((rainbowChain) =>
        rainbowChain.chains.find(
          (chain) =>
            chain.rpcUrls.default.http[0] === rainbowChain.activeRpcUrl,
        ),
      )
      .filter(Boolean);
  }, [rainbowChains]);

  return { rainbowChains: chains };
};
