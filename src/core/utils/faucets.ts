import {
  avalancheFuji,
  moonbaseAlpha,
  polygonZkEvm,
  scrollSepolia,
} from 'viem/chains';

import { ChainId } from '../types/chains';

export const TestnetFaucet = {
  [ChainId.goerli]: 'https://goerlifaucet.com',
  [ChainId.sepolia]: 'https://sepoliafaucet.com',
  [ChainId.holesky]: 'https://faucet.quicknode.com/ethereum/holesky',
  [ChainId.optimismSepolia]: 'https://app.optimism.io/faucet',
  [ChainId.bscTestnet]: 'https://www.bnbchain.org/en/testnet-faucet',
  [ChainId.polygonMumbai]: 'https://faucet.polygon.technology',
  [ChainId.arbitrumGoerli]: 'https://faucet.quicknode.com/arbitrum/goerli',
  [ChainId.arbitrumSepolia]: 'https://faucet.quicknode.com/arbitrum/sepolia',
  [ChainId.baseSepolia]: 'https://app.optimism.io/faucet',
  [ChainId.zoraTestnet]: 'https://app.optimism.io/faucet',
  [ChainId.zoraSepolia]: 'https://app.optimism.io/faucet',
  [moonbaseAlpha.id]: 'https://faucet.paradigm.xyz',
  [scrollSepolia.id]: 'https://faucet.quicknode.com/scroll/sepolia',
  [avalancheFuji.id]: 'https://faucet.quicknode.com/avalanche/fuji',
  [polygonZkEvm.id]: 'https://faucet.polygon.technology',
} as const;
