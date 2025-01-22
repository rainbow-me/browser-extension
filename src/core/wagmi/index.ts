import { useEffect } from 'react';
import { Chain, HttpTransport, Transport, http } from 'viem';
import { createConfig } from 'wagmi';

import { useBackendNetworksStore } from '~/core/state/backendNetworks/backendNetworks';
import { useRainbowChains } from '~/entries/popup/hooks/useRainbowChains';

import { handleRpcUrl } from './clientRpc';

const createChains = (chains: Chain[]): [Chain, ...Chain[]] => {
  return chains.map((chain) => {
    const rpcUrl = handleRpcUrl(chain);
    return {
      ...chain,
      rpcUrls: {
        default: { http: [rpcUrl] },
        public: { http: [rpcUrl] },
      },
    } as Chain;
  }) as [Chain, ...Chain[]];
};

const createTransports = (chains: Chain[]): Record<number, Transport> => {
  return chains.reduce((acc: Record<number, HttpTransport>, chain) => {
    acc[chain.id] = http(handleRpcUrl(chain));
    return acc;
  }, {});
};

let wagmiConfig = createConfig({
  chains: createChains(useBackendNetworksStore.getState().getSupportedChains()),
  transports: createTransports(
    useBackendNetworksStore.getState().getSupportedChains(),
  ),
});

const updateWagmiConfig = (chains: Chain[]) => {
  wagmiConfig = createConfig({
    chains: createChains(chains),
    transports: createTransports(chains),
  });
};

const WagmiConfigUpdater = () => {
  const { rainbowChains: chains } = useRainbowChains();
  useEffect(() => {
    updateWagmiConfig(chains);
  }, [chains]);

  return null;
};

export { wagmiConfig, WagmiConfigUpdater, updateWagmiConfig };
