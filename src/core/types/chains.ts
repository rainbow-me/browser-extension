import * as chain from '@wagmi/chains';
import type { Chain } from 'wagmi';

const HARDHAT_CHAIN_ID = 1337;
const HARDHAT_OP_CHAIN_ID = 1338;

export const hardhat: Chain = {
  id: HARDHAT_CHAIN_ID,
  name: 'Hardhat',
  network: 'hardhat',
  nativeCurrency: {
    decimals: 18,
    name: 'Hardhat',
    symbol: 'eth',
  },
  rpcUrls: {
    public: { http: ['http://127.0.0.1:8545'] },
    default: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
};

export const hardhatOptimism: Chain = {
  id: HARDHAT_OP_CHAIN_ID,
  name: 'Hardhat OP',
  network: 'hardhatOptimism',
  nativeCurrency: {
    decimals: 18,
    name: 'Hardhat Op',
    symbol: 'op',
  },
  rpcUrls: {
    public: { http: ['http://127.0.0.1:8545'] },
    default: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
};

export enum ChainName {
  arbitrum = 'arbitrum',
  base = 'base',
  bsc = 'bsc',
  optimism = 'optimism',
  polygon = 'polygon',
  zora = 'zora',
  mainnet = 'mainnet',
  hardhat = 'hardhat',
  hardhatOptimism = 'hardhatOptimism',
  goerli = 'goerli',
  sepolia = 'sepolia',
  optimismGoerli = 'optimism-goerli',
  bscTestnet = 'bsc-testnet',
  polygonMumbai = 'polygon-mumbai',
  arbitrumGoerli = 'arbitrum-goerli',
  baseGoerli = 'base-goerli',
  zoraTestnet = 'zora-testnet',
}

export enum ChainId {
  arbitrum = chain.arbitrum.id,
  base = chain.base.id,
  bsc = chain.bsc.id,
  optimism = chain.optimism.id,
  mainnet = chain.mainnet.id,
  polygon = chain.polygon.id,
  zora = chain.zora.id,
  hardhat = HARDHAT_CHAIN_ID,
  hardhatOptimism = HARDHAT_OP_CHAIN_ID,
  goerli = chain.goerli.id,
  sepolia = chain.sepolia.id,
  'optimism-goerli' = chain.optimismGoerli.id,
  'bsc-testnet' = chain.bscTestnet.id,
  'polygon-mumbai' = chain.polygonMumbai.id,
  'arbitrum-goerli' = chain.arbitrumGoerli.id,
  'base-goerli' = chain.baseGoerli.id,
  'zora-testnet' = chain.zoraTestnet.id,
}

export const ChainNameDisplay = {
  [ChainId.arbitrum]: 'Arbitrum',
  [ChainId.base]: 'Base',
  [ChainId.bsc]: 'BSC',
  [ChainId.optimism]: 'Optimism',
  [ChainId.polygon]: 'Polygon',
  [ChainId.zora]: 'Zora',
  [ChainId.mainnet]: 'Ethereum',
  [ChainId.hardhat]: 'Hardhat',
  [ChainId.hardhatOptimism]: 'Hardhat Optimism',
  [ChainId.goerli]: chain.goerli.name,
  [ChainId.sepolia]: chain.sepolia.name,
  [ChainId['optimism-goerli']]: chain.optimismGoerli.name,
  [ChainId['bsc-testnet']]: 'BSC Testnet',
  [ChainId['polygon-mumbai']]: chain.polygonMumbai.name,
  [ChainId['arbitrum-goerli']]: chain.arbitrumGoerli.name,
  [ChainId['base-goerli']]: chain.baseGoerli.name,
  [ChainId['zora-testnet']]: chain.zoraTestnet.name,
} as const;
