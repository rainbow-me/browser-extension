import * as chain from '@wagmi/chains';
import type { Chain } from 'wagmi';

const HARDHAT_CHAIN_ID = 1337;
const HARDHAT_OP_CHAIN_ID = 1338;
const HOLESKI_CHAIN_ID = 17000;
const OPTIMISM_SEPOLIA_CHAIN_ID = 11155420;
const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

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
  network: 'hardhat-optimism',
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

export const holeski: Chain = {
  id: HOLESKI_CHAIN_ID,
  name: 'Holesky',
  network: 'holesky',
  nativeCurrency: {
    decimals: 18,
    name: 'Holeski Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: [''] },
    default: { http: [''] },
  },
  testnet: true,
};

export const arbitrumSepolia: Chain = {
  id: ARBITRUM_SEPOLIA_CHAIN_ID,
  name: 'Arbitrum Sepolia',
  network: 'arbitrum-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Arbitrum Sepolia Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: [''] },
    default: { http: [''] },
  },
  testnet: true,
};

export const optimismSepolia: Chain = {
  id: OPTIMISM_SEPOLIA_CHAIN_ID,
  name: 'Optimism Sepolia',
  network: 'optimism-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Optimism Sepolia Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: [''] },
    default: { http: [''] },
  },
  testnet: true,
};

export enum ChainName {
  arbitrum = 'arbitrum',
  arbitrumSepolia = 'arbitrum-sepolia',
  base = 'base',
  bsc = 'bsc',
  optimism = 'optimism',
  polygon = 'polygon',
  zora = 'zora',
  mainnet = 'mainnet',
  holeski = 'holeski',
  hardhat = 'hardhat',
  hardhatOptimism = 'hardhat-optimism',
  goerli = 'goerli',
  sepolia = 'sepolia',
  optimismGoerli = 'optimism-goerli',
  optimismSepolia = 'optimism-sepolia',
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
  'hardhat-optimism' = HARDHAT_OP_CHAIN_ID,
  goerli = chain.goerli.id,
  sepolia = chain.sepolia.id,
  holesky = holeski.id,
  'optimism-goerli' = chain.optimismGoerli.id,
  'optimism-sepolia' = optimismSepolia.id,
  'bsc-testnet' = chain.bscTestnet.id,
  'polygon-mumbai' = chain.polygonMumbai.id,
  'arbitrum-goerli' = chain.arbitrumGoerli.id,
  'arbitrum-sepolia' = arbitrumSepolia.id,
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
  [ChainId['hardhat-optimism']]: 'Hardhat Optimism',
  [ChainId.goerli]: chain.goerli.name,
  [ChainId.sepolia]: chain.sepolia.name,
  [ChainId['holesky']]: holeski.name,
  [ChainId['optimism-goerli']]: chain.optimismGoerli.name,
  [ChainId['optimism-sepolia']]: optimismSepolia.name,
  [ChainId['bsc-testnet']]: 'BSC Testnet',
  [ChainId['polygon-mumbai']]: chain.polygonMumbai.name,
  [ChainId['arbitrum-goerli']]: chain.arbitrumGoerli.name,
  [ChainId['arbitrum-sepolia']]: arbitrumSepolia.name,
  [ChainId['base-goerli']]: chain.baseGoerli.name,
  [ChainId['zora-testnet']]: chain.zoraTestnet.name,
} as const;
