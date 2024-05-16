import { useEffect } from 'react';
import { Chain, HttpTransport, Transport, http } from 'viem';
import { createConfig } from 'wagmi';

import { useRainbowChains } from '~/entries/popup/hooks/useRainbowChains';

import { proxyRpcEndpoint } from '../providers';
import { SUPPORTED_CHAINS, getDefaultRPC } from '../references';
import { ChainId, chainHardhat, chainHardhatOptimism } from '../types/chains';
import { findRainbowChainForChainId } from '../utils/chains';

const IS_TESTING = process.env.IS_TESTING === 'true';

const supportedChains = IS_TESTING
  ? [...SUPPORTED_CHAINS, chainHardhat, chainHardhatOptimism]
  : SUPPORTED_CHAINS;

const handleRpcUrl = (chain: Chain) => {
  if (IS_TESTING && chain.id === ChainId.mainnet) {
    return chainHardhat.rpcUrls.default.http[0];
  } else if (IS_TESTING && chain.id === ChainId.optimism) {
    return chainHardhatOptimism.rpcUrls.default.http[0];
  } else {
    return proxyRpcEndpoint(
      getOriginalRpcEndpoint(chain)?.http || '',
      chain.id,
    );
  }
};

const getOriginalRpcEndpoint = (chain: Chain) => {
  // overrides have preference
  const userAddedNetwork = findRainbowChainForChainId(chain.id);
  if (userAddedNetwork) {
    return { http: userAddedNetwork.rpcUrls.default.http[0] };
  }
  if (chain.id === ChainId.hardhat || chain.id === ChainId.hardhatOptimism) {
    return { http: chain.rpcUrls.default.http[0] };
  }

  return getDefaultRPC(chain.id);
};

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
  const { rainbowChains: chains } = useRainbowChains();
  useEffect(() => {
    updateWagmiConfig(chains);
  }, [chains]);

  return null;
};

export { wagmiConfig, WagmiConfigUpdater, updateWagmiConfig };
