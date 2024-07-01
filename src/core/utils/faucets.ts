import {
  lightlinkPegasus,
  moonbaseAlpha,
  polygonZkEvm,
  scrollSepolia,
} from 'viem/chains';

import { ChainId } from '../types/chains';

export const TestnetFaucet = {
  [ChainId.sepolia]: 'https://sepoliafaucet.com',
  [ChainId.holesky]: 'https://faucet.quicknode.com/ethereum/holesky',
  [ChainId.optimismSepolia]: 'https://app.optimism.io/faucet',
  [ChainId.bscTestnet]: 'https://www.bnbchain.org/en/testnet-faucet',
  [ChainId.arbitrumSepolia]: 'https://faucet.quicknode.com/arbitrum/sepolia',
  [ChainId.baseSepolia]: 'https://app.optimism.io/faucet',
  [ChainId.zoraSepolia]: 'https://app.optimism.io/faucet',
  [ChainId.avalancheFuji]: 'https://faucet.quicknode.com/avalanche/fuji',
  [ChainId.blastSepolia]: 'https://faucet.quicknode.com/blast/sepolia',
  [ChainId.polygonAmoy]: 'https://faucet.polygon.technology',
  [lightlinkPegasus.id]: 'https://faucet.pegasus.lightlink.io',
  [moonbaseAlpha.id]: 'https://faucet.paradigm.xyz',
  [scrollSepolia.id]: 'https://faucet.quicknode.com/scroll/sepolia',
  [polygonZkEvm.id]: 'https://faucet.polygon.technology',
} as const;
