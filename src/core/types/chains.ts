import { Chain } from 'wagmi';

export enum ChainName {
  arbitrum = 'arbitrum',
  bsc = 'bsc',
  optimism = 'optimism',
  polygon = 'polygon',
  mainnet = 'mainnet',
}

export enum ChainId {
  arbitrum = 42161,
  bsc = 56,
  optimism = 10,
  mainnet = 1,
  polygon = 137,
}

export const bsc: Chain = {
  id: 56,
  name: 'Binance Smart Chain',
  network: 'bsc',
  nativeCurrency: {
    decimals: 18,
    name: 'Binance Chain',
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
