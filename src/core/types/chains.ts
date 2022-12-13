import { Chain, chain } from 'wagmi';

const BSC_CHAIN_ID = 56;

export const bsc: Chain = {
  id: BSC_CHAIN_ID,
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

export enum ChainName {
  arbitrum = 'arbitrum',
  bsc = 'bsc',
  goerli = 'goerli',
  optimism = 'optimism',
  polygon = 'polygon',
  mainnet = 'mainnet',
}

export enum ChainId {
  arbitrum = chain.arbitrum.id,
  bsc = BSC_CHAIN_ID,
  goerli = chain.goerli.id,
  optimism = chain.optimism.id,
  mainnet = chain.mainnet.id,
  polygon = chain.polygon.id,
}
