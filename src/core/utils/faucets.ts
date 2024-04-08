import { moonbaseAlpha, polygonZkEvm, scrollSepolia } from 'viem/chains';

import { ChainId } from '../types/chains';

export const TestnetFaucet = {
  [ChainId.arbitrumSepolia]: 'https://faucet.quicknode.com/arbitrum/sepolia',
  [ChainId.avalancheFuji]: 'https://faucet.quicknode.com/avalanche/fuji',
  [ChainId.baseSepolia]: 'https://app.optimism.io/faucet',
  [ChainId.blastSepolia]: 'https://faucet.quicknode.com/blast/sepolia',
  [ChainId.bscTestnet]: 'https://www.bnbchain.org/en/testnet-faucet',
  [ChainId.holesky]: 'https://faucet.quicknode.com/ethereum/holesky',
  [moonbaseAlpha.id]: 'https://faucet.paradigm.xyz',
  [ChainId.optimismSepolia]: 'https://app.optimism.io/faucet',
  [ChainId.polygonAmoy]: 'https://faucet.polygon.technology',
  [polygonZkEvm.id]: 'https://faucet.polygon.technology',
  [scrollSepolia.id]: 'https://faucet.quicknode.com/scroll/sepolia',
  [ChainId.sepolia]: 'https://sepoliafaucet.com',
  [ChainId.zoraSepolia]: 'https://app.optimism.io/faucet',
} as const;
