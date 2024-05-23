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

import { ChainNameDisplay } from '../types/chains';

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
