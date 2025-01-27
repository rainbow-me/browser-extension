import { ChainId } from '~/core/types/chains';

/**
 * @deprecated - these will be moved to custom backend networks soon
 * !!! DO NOT ADD NEW FAUCETS HERE, ONLY ADD NEW FAUCETS TO CUSTOM NETWORKS
 */
export const FALLBACK_TESTNET_FAUCETS = {
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
  [ChainId.inkSepolia]: 'https://inkonchain.com/faucet',
} as const;
