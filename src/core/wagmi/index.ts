import { useEffect } from 'react';
import { Chain, HttpTransport, Transport, http } from 'viem';
import { createConfig } from 'wagmi';

import { networkStore } from '~/core/state/networks/networks';

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

const supportedChains = Object.values(
  networkStore.getState().getBackendSupportedChains(true),
);

let wagmiConfig = createConfig({
  chains: createChains(supportedChains),
  transports: createTransports(supportedChains),
});

const updateWagmiConfig = (chains: Chain[]) => {
  console.log('updateWagmiConfig', chains);
  wagmiConfig = createConfig({
    chains: createChains(chains),
    transports: createTransports(chains),
  });
};

const WagmiConfigUpdater = () => {
  const activeChains = networkStore((state) => state.getAllActiveRpcChains());
  useEffect(() => {
    updateWagmiConfig(activeChains);
  }, [activeChains]);

  return null;
};

export { wagmiConfig, WagmiConfigUpdater, updateWagmiConfig };
