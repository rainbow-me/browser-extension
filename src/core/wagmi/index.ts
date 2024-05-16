import { useEffect } from 'react';
import { Chain, HttpTransport, Transport, http } from 'viem';
import { createConfig } from 'wagmi';

import { proxyRpcEndpoint } from '../providers';
import { SUPPORTED_CHAINS } from '../references';
import { useRainbowChainsStore } from '../state';
import { ChainId, chainHardhat, chainHardhatOptimism } from '../types/chains';
import { getOriginalRpcEndpoint } from '../utils/chains';

const IS_TESTING = process.env.IS_TESTING === 'true';

const supportedChains = IS_TESTING
  ? [...SUPPORTED_CHAINS, chainHardhat, chainHardhatOptimism]
  : SUPPORTED_CHAINS;

const createChains = (chains: Chain[]): [Chain, ...Chain[]] => {
  return chains.map((chain) => {
    const rpcUrl =
      IS_TESTING && chain.id === ChainId.mainnet
        ? chainHardhat.rpcUrls.default.http[0]
        : proxyRpcEndpoint(getOriginalRpcEndpoint(chain)?.http || '', chain.id);
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
    acc[chain.id] = http(
      IS_TESTING && chain.id === ChainId.mainnet
        ? chainHardhat.rpcUrls.default.http[0]
        : proxyRpcEndpoint(getOriginalRpcEndpoint(chain)?.http || '', chain.id),
    );
    return acc;
  }, {});
};

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
  const rainbowChains = useRainbowChainsStore((state) => state.rainbowChains);
  const chains = Object.values(rainbowChains)
    .map((rainbowChain) =>
      rainbowChain.chains.find(
        (rpc) => rpc.rpcUrls.default.http[0] === rainbowChain.activeRpcUrl,
      ),
    )
    .filter(Boolean) as [Chain, ...Chain[]];

  useEffect(() => {
    updateWagmiConfig(chains);
  }, [chains]);

  return null;
};

export { wagmiConfig, WagmiConfigUpdater, updateWagmiConfig };
