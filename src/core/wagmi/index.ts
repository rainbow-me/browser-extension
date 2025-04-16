import { useEffect } from 'react';
import { Chain, HttpTransport, Transport, http } from 'viem';
import { createConfig } from 'wagmi';

import { useNetworkStore } from '~/core/state/networks/networks';

import { handleRpcUrl } from './clientRpc';

export const createChains = (chains: Chain[]): [Chain, ...Chain[]] => {
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

export const createTransports = (
  chains: Chain[],
): Record<number, Transport> => {
  return chains.reduce((acc: Record<number, HttpTransport>, chain) => {
    acc[chain.id] = http(handleRpcUrl(chain));
    return acc;
  }, {});
};

const supportedChains = Object.values(
  useNetworkStore.getState().getBackendSupportedChains(true),
);

let wagmiConfig = createConfig({
  chains: createChains(supportedChains),
  transports: createTransports(supportedChains),
});

const updateWagmiConfig = (chains: Chain[]) => {
  wagmiConfig = createConfig({
    chains: createChains(chains),
    transports: createTransports(chains),
  });
};

const WagmiConfigUpdater = () => {
  const activeChains = useNetworkStore((state) =>
    state.getAllActiveRpcChains(),
  );
  useEffect(() => {
    updateWagmiConfig(activeChains);
  }, [activeChains]);

  return null;
};

export { wagmiConfig, WagmiConfigUpdater, updateWagmiConfig };
