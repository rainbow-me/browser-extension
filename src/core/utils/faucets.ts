import {
  celoAlfajores,
  fantomTestnet,
  filecoinCalibration,
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
  [ChainId.bscTestnet]: 'https://bnbchain.org/en/testnet-faucet',
  [ChainId.arbitrumSepolia]: 'https://faucet.quicknode.com/arbitrum/sepolia',
  [ChainId.baseSepolia]: 'https://app.optimism.io/faucet',
  [ChainId.zoraSepolia]: 'https://app.optimism.io/faucet',
  [ChainId.avalancheFuji]: 'https://faucet.quicknode.com/avalanche/fuji',
  [ChainId.blastSepolia]: 'https://faucet.quicknode.com/blast/sepolia',
  [ChainId.polygonAmoy]: 'https://faucet.polygon.technology',
  [celoAlfajores.id]: 'https://faucet.celo.org/alfajores',
  [fantomTestnet.id]: 'https://faucet.fantom.network',
  [filecoinCalibration.id]: 'https://beryx.io/faucet',
  [lightlinkPegasus.id]: 'https://faucet.pegasus.lightlink.io',
  [moonbaseAlpha.id]: 'https://faucet.paradigm.xyz',
  [polygonZkEvm.id]: 'https://faucet.polygon.technology',
  [scrollSepolia.id]: 'https://faucet.quicknode.com/scroll/sepolia',
  1123: 'https://bsquared.network/faucet',
  28882: 'https://l2faucet.com',
  7701: 'https://cantofaucet.com',
  1918988905: 'https://testnet.rarichain.org/faucet',
} as const;
