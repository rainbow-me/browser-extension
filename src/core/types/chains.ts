import { Chain, chain } from 'wagmi';

const BSC_CHAIN_ID = 56;
const HARDHAT_CHAIN_ID = 1337;

export const bsc: Chain = {
  id: BSC_CHAIN_ID,
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
  id: HARDHAT_CHAIN_ID,
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
  goerli = 'goerli',
  optimism = 'optimism',
  polygon = 'polygon',
  mainnet = 'mainnet',
  hardhat = 'hardhat',
}

export enum ChainId {
  arbitrum = chain.arbitrum.id,
  bsc = BSC_CHAIN_ID,
  goerli = chain.goerli.id,
  optimism = chain.optimism.id,
  mainnet = chain.mainnet.id,
  polygon = chain.polygon.id,
  hardhat = HARDHAT_CHAIN_ID,
}

export const ChainNameDisplay = {
  [ChainId.arbitrum]: 'Arbitrum',
  [ChainId.bsc]: 'BSC',
  [ChainId.optimism]: 'Optimism',
  [ChainId.polygon]: 'Polygon',
  [ChainId.mainnet]: 'Ethereum',
  [ChainId.hardhat]: 'Hardhat',
};
