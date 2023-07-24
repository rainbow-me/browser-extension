import * as chain from '@wagmi/chains';
import type { Chain } from 'wagmi';

const HARDHAT_CHAIN_ID = 1337;

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
  bsc = chain.bsc.id,
  goerli = chain.goerli.id,
  optimism = chain.optimism.id,
  mainnet = chain.mainnet.id,
  polygon = chain.polygon.id,
  hardhat = HARDHAT_CHAIN_ID,
}

export const ChainNameDisplay = {
  [ChainId.arbitrum]: 'Arbitrum',
  [ChainId.bsc]: 'Binance Chain',
  [ChainId.optimism]: 'Optimism',
  [ChainId.polygon]: 'Polygon',
  [ChainId.mainnet]: 'Ethereum',
  [ChainId.hardhat]: 'Hardhat',
};
