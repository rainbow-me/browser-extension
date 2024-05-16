import { useEffect } from 'react';
import { Chain, Transport, http } from 'viem';
import { createConfig } from 'wagmi';

import { proxyRpcEndpoint } from '../providers';
import { SUPPORTED_CHAINS } from '../references';
import { useRainbowChainsStore } from '../state';
import { chainHardhat, chainHardhatOptimism } from '../types/chains';
import { getOriginalRpcEndpoint } from '../utils/chains';

const IS_TESTING = process.env.IS_TESTING === 'true';

const supportedChains = IS_TESTING
  ? SUPPORTED_CHAINS.concat(chainHardhat, chainHardhatOptimism)
  : SUPPORTED_CHAINS;

const wagmiChains = supportedChains.map((chain) => {
  const rpcUrl = proxyRpcEndpoint(
    getOriginalRpcEndpoint(chain)?.http || '',
    chain.id,
  );
  return {
    ...chain,
    rpcUrls: {
      default: {
        http: [rpcUrl],
      },
      public: {
        http: [rpcUrl],
      },
    },
  } as Chain;
}) as [Chain, ...Chain[]];

const transports = wagmiChains.reduce(
  (acc: Record<number, Transport>, chain: Chain) => {
    acc[chain.id] = http(
      proxyRpcEndpoint(getOriginalRpcEndpoint(chain)?.http || '', chain.id),
    );
    return acc;
  },
  {},
);

let wagmiConfig = createConfig({
  chains: wagmiChains,
  transports,
});

const updateWagmiConfig = (chains: Chain[]) => {
  const wagmiChains = chains.map((chain) => {
    const rpcUrl = proxyRpcEndpoint(
      getOriginalRpcEndpoint(chain)?.http || '',
      chain.id,
    );
    return {
      ...chain,
      rpcUrls: {
        default: {
          http: [rpcUrl],
        },
        public: {
          http: [rpcUrl],
        },
      },
    } as Chain;
  }) as [Chain, ...Chain[]];

  const transports = chains.reduce(
    (acc: Record<number, Transport>, chain: Chain) => {
      acc[chain.id] = http(
        proxyRpcEndpoint(getOriginalRpcEndpoint(chain)?.http || '', chain.id),
      );
      return acc;
    },
    {},
  );

  wagmiConfig = createConfig({
    chains: wagmiChains,
    transports,
  });
};

const WagmiConfigUpdater = () => {
  const rainbowChains = useRainbowChainsStore.use.rainbowChains();
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

export { wagmiConfig, WagmiConfigUpdater };
