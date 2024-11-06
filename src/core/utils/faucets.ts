import backendNetworks from 'static/data/networks.json';

import { ChainId } from '../types/chains';

const CUSTOM_NETWORK_FAUCETS = backendNetworks.customNetworks
  .filter((network) => network.testnet.isTestnet)
  .reduce(
    (acc, network) => {
      if (network.testnet.isTestnet && network.testnet.FaucetURL)
        acc[network.id] = network.testnet.FaucetURL;
      return acc;
    },
    {} as Record<ChainId, string>,
  );

export const TestnetFaucet = {
  [ChainId.sepolia]: 'https://sepoliafaucet.com',
  [ChainId.holesky]: 'https://faucet.quicknode.com/ethereum/holesky',
  [ChainId.optimismSepolia]: 'https://app.optimism.io/faucet',
  [ChainId.bscTestnet]: 'https://bnbchain.org/en/testnet-faucet',
  [ChainId.arbitrumSepolia]: 'https://faucet.quicknode.com/arbitrum/sepolia',
  [ChainId.baseSepolia]: 'https://app.optimism.io/faucet',
  [ChainId.zoraSepolia]: 'https://app.optimism.io/faucet',
  [ChainId.avalancheFuji]: 'https://faucet.quicknode.com/avalanche/fuji',
  [ChainId.blastSepolia]: 'https://faucet.quicknode.com/blast/sepolia',
  [ChainId.polygonAmoy]: 'https://faucet.polygon.technology',
  [ChainId.apechainCurtis]: 'https://curtis.hub.caldera.xyz/',
  ...CUSTOM_NETWORK_FAUCETS,
};
