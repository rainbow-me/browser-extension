import { Chain } from 'wagmi';

export enum ChainId {
  arbitrum = 42161,
  bsc = 56,
  // goerli = 5,
  optimism = 10,
  mainnet = 1,
  polygon = 137,
  hardhat = 1337,
}

export const bsc: Chain = {
  id: ChainId.bsc,
  name: 'BNB Smart Chain',
  network: 'bsc',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB Smart Chain',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: process.env.BSC_MAINNET_RPC as string,
  },
  blockExplorers: {
    default: { name: '', url: 'https://www.bscscan.com/' },
  },
  testnet: false,
};

export const hardhat: Chain = {
  id: ChainId.hardhat,
  name: 'Hardhat',
  network: 'hardhat',
  nativeCurrency: {
    decimals: 18,
    name: 'Hardhat',
    symbol: 'eth',
  },
  rpcUrls: {
    default: 'http://127.0.0.1:8545',
  },
  testnet: true,
};

export enum ChainName {
  arbitrum = 'arbitrum',
  bsc = 'bsc',
  // goerli = 'goerli',
  optimism = 'optimism',
  polygon = 'polygon',
  mainnet = 'mainnet',
  hardhat = 'hardhat',
}

export const ChainNameDisplay = {
  [ChainId.arbitrum]: 'Arbitrum',
  [ChainId.bsc]: 'Binance Chain',
  [ChainId.optimism]: 'Optimism',
  [ChainId.polygon]: 'Polygon',
  [ChainId.mainnet]: 'Ethereum',
  // [ChainId.goerli]: 'Goerli',
  [ChainId.hardhat]: 'Hardhat',
};
