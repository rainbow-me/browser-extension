import {
  Chain,
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  blast,
  blastSepolia,
  bsc,
  bscTestnet,
  degen,
  holesky,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  sepolia,
  zora,
  zoraSepolia,
} from 'viem/chains';

import { ChainId, ChainNameDisplay } from '../types/chains';

export const SUPPORTED_MAINNET_CHAINS: Chain[] = [
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
  bsc,
  avalanche,
  blast,
  degen,
].map((chain) => ({ ...chain, name: ChainNameDisplay[chain.id] }));

export const SUPPORTED_CHAINS: Chain[] = [
  mainnet,
  polygon,
  optimism,
  arbitrum,
  holesky,
  base,
  zora,
  bsc,
  sepolia,
  optimismSepolia,
  bscTestnet,
  arbitrumSepolia,
  baseSepolia,
  zoraSepolia,
  avalanche,
  avalancheFuji,
  blast,
  blastSepolia,
  polygonAmoy,
  degen,
].map((chain) => ({ ...chain, name: ChainNameDisplay[chain.id] }));

export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map((chain) => chain.id);

export const SUPPORTED_TESTNET_CHAINS: Chain[] = [
  holesky,
  sepolia,
  optimismSepolia,
  bscTestnet,
  arbitrumSepolia,
  baseSepolia,
  zoraSepolia,
  avalancheFuji,
  blastSepolia,
  polygonAmoy,
];

export const SUPPORTED_TESTNET_CHAIN_IDS: number[] =
  SUPPORTED_TESTNET_CHAINS.map((tn) => tn.id);

export const getDefaultRPC = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.mainnet:
      return { http: process.env.ETH_MAINNET_RPC };
    case ChainId.optimism:
      return { http: process.env.OPTIMISM_MAINNET_RPC };
    case ChainId.arbitrum:
      return { http: process.env.ARBITRUM_MAINNET_RPC };
    case ChainId.polygon:
      return { http: process.env.POLYGON_MAINNET_RPC };
    case ChainId.base:
      return { http: process.env.BASE_MAINNET_RPC };
    case ChainId.zora:
      return { http: process.env.ZORA_MAINNET_RPC };
    case ChainId.bsc:
      return { http: process.env.BSC_MAINNET_RPC };
    case ChainId.sepolia:
      return { http: process.env.ETH_SEPOLIA_RPC };
    case ChainId.holesky:
      return { http: process.env.ETH_HOLESKY_RPC };
    case ChainId.optimismSepolia:
      return { http: process.env.OPTIMISM_SEPOLIA_RPC };
    case ChainId.bscTestnet:
      return { http: process.env.BSC_TESTNET_RPC };
    case ChainId.arbitrumSepolia:
      return { http: process.env.ARBITRUM_SEPOLIA_RPC };
    case ChainId.baseSepolia:
      return { http: process.env.BASE_SEPOLIA_RPC };
    case ChainId.zoraSepolia:
      return { http: process.env.ZORA_SEPOLIA_RPC };
    case ChainId.avalanche:
      return { http: process.env.AVALANCHE_MAINNET_RPC };
    case ChainId.avalancheFuji:
      return { http: process.env.AVALANCHE_FUJI_RPC };
    case ChainId.blast:
      return { http: process.env.BLAST_MAINNET_RPC };
    case ChainId.blastSepolia:
      return { http: process.env.BLAST_SEPOLIA_RPC };
    case ChainId.polygonAmoy:
      return { http: process.env.POLYGON_AMOY_RPC };
    case ChainId.degen:
      return { http: process.env.DEGEN_MAINNET_RPC };
    default:
      return null;
  }
};
