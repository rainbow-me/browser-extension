import { AddressZero } from '@ethersproject/constants';
import {
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  goerli,
  holesky,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonMumbai,
  zora,
  zoraSepolia,
} from 'viem/chains';
import { Address, type Chain, sepolia } from 'wagmi';

import { ChainId, ChainNameDisplay, chainBlast, chainBlastSepolia } from '~/core/types/chains';

import { AddressOrEth } from '../types/assets';

export { ethUnits } from './ethUnits';
export { gasUnits } from './gasUnits';
export { supportedCurrencies } from './supportedCurrencies';

export const smartContractMethods = {
  punk_transfer: {
    method: 'transferPunk(address,uint256)',
    hash: '0x8b72a2ec',
  },
  token_transfer: {
    method: 'transfer(address,uint256)',
    hash: '0xa9059cbb',
  },
  token_balance: {
    method: 'balanceOf(address)',
    hash: '0x70a08231',
  },
  nft_transfer: {
    method: 'transfer(address,uint256)',
    hash: '0xa9059cbb',
  },
  nft_transfer_from: {
    method: 'transferFrom(address,address,uint256)',
    hash: '0x23b872dd',
  },
  nft_safe_transfer_from: {
    method: 'safeTransferFrom(address,address,uint256)',
    hash: '0x42842e0e',
  },
  erc721_transfer_from: {
    method: 'transferFrom(address,address,uint256)',
    hash: '0x23b872dd',
  },
  erc1155_safe_transfer_from: {
    method: 'safeTransferFrom(address,address,uint256,uint256,bytes)',
    hash: '0xf242432a',
  },
};

export type {
  SupportedCurrency,
  SupportedCurrencyKey,
} from './supportedCurrencies';

// mainnet
export const ETH_ADDRESS = 'eth';
export const DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f';
export const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
export const WBTC_ADDRESS = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
export const MATIC_MAINNET_ADDRESS =
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0';
export const BNB_MAINNET_ADDRESS = '0xb8c77482e45f1f44de1745f52c74426c631bdd52';
export const SOCKS_ADDRESS = '0x23b608675a2b2fb1890d3abbd85c5775c51691d5';
export const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

// optimism
export const ETH_OPTIMISM_ADDRESS = AddressZero;
export const OP_ADDRESS = '0x4200000000000000000000000000000000000042';
export const WETH_OPTIMISM_ADDRESS =
  '0x4200000000000000000000000000000000000006';
export const DAI_OPTIMISM_ADDRESS =
  '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1';
export const USDC_OPTIMISM_ADDRESS =
  '0x7f5c764cbc14f9669b88837ca1490cca17c31607';
export const WBTC_OPTIMISM_ADDRESS =
  '0x68f180fcce6836688e9084f035309e29bf0a2095';

// base
export const ETH_BASE_ADDRESS = AddressZero;
export const WETH_BASE_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
export const DAI_BASE_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f';
export const USDC_BASE_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

// zora
export const ETH_ZORA_ADDRESS = AddressZero;
export const WETH_ZORA_ADDRESS = '0x4200000000000000000000000000000000000006';

// bsc
export const BNB_BSC_ADDRESS = AddressZero;
export const DAI_BSC_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f';
export const USDC_BSC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

// polygon
export const MATIC_POLYGON_ADDRESS =
  '0x0000000000000000000000000000000000001010';
export const WETH_POLYGON_ADDRESS =
  '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619';
export const DAI_POLYGON_ADDRESS = '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063';
export const USDC_POLYGON_ADDRESS =
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';
export const WBTC_POLYGON_ADDRESS =
  '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6';

// arbitrum
export const ETH_ARBITRUM_ADDRESS = AddressZero;
export const DAI_ARBITRUM_ADDRESS =
  '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1';
export const USDC_ARBITRUM_ADDRESS =
  '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8';
export const WBTC_ARBITRUM_ADDRESS =
  '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f';
export const SOCKS_ARBITRUM_ADDRESS =
  '0xd803b242d32d71618d0646531c0cc4a5d26d1598';

// avalanche
export const AVAX_AVALANCHE_ADDRESS = AddressZero;
export const WAVAX_AVALANCHE_ADDRESS =
  '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';
export const DAI_AVALANCHE_ADDRESS =
  '0x6b175474e89094c44da98b954eedeac495271d0f';
export const USDC_AVALANCHE_ADDRESS =
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
export const WBTC_AVALANCHE_ADDRESS =
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';

export const NATIVE_ASSETS_PER_CHAIN: Record<ChainId, AddressOrEth> = {
  [ChainId.mainnet]: ETH_ADDRESS as Address,
  [ChainId.hardhat]: AddressZero as Address,
  [ChainId.goerli]: AddressZero as Address,
  [ChainId.sepolia]: AddressZero as Address,
  [ChainId.holesky]: AddressZero as Address,
  [ChainId.arbitrum]: ETH_ARBITRUM_ADDRESS as Address,
  [ChainId.arbitrumGoerli]: AddressZero as Address,
  [ChainId.arbitrumSepolia]: AddressZero as Address,
  [ChainId.bsc]: BNB_BSC_ADDRESS as Address,
  [ChainId.bscTestnet]: AddressZero as Address,
  [ChainId.optimism]: ETH_OPTIMISM_ADDRESS as Address,
  [ChainId.hardhatOptimism]: AddressZero as Address,
  [ChainId.optimismSepolia]: AddressZero as Address,
  [ChainId.rari]: AddressZero as Address,
  [ChainId.base]: ETH_BASE_ADDRESS as Address,
  [ChainId.baseSepolia]: AddressZero as Address,
  [ChainId.zora]: ETH_ZORA_ADDRESS as Address,
  [ChainId.zoraSepolia]: AddressZero as Address,
  [ChainId.polygon]: MATIC_POLYGON_ADDRESS as Address,
  [ChainId.polygonMumbai]: AddressZero as Address,
  [ChainId.avalanche]: AVAX_AVALANCHE_ADDRESS as Address,
  [ChainId.avalancheFuji]: AddressZero as Address,
  [ChainId.blast]: AddressZero as Address,
  [ChainId.blastSepolia]: AddressZero as Address,
};

export const NATIVE_ASSETS_MAP_PER_CHAIN: Record<ChainId, AddressOrEth> = {
  [ChainId.mainnet]: ETH_ADDRESS,
  [ChainId.hardhat]: ETH_ADDRESS,
  [ChainId.goerli]: ETH_ADDRESS,
  [ChainId.sepolia]: ETH_ADDRESS,
  [ChainId.holesky]: ETH_ADDRESS,
  [ChainId.arbitrum]: ETH_ADDRESS,
  [ChainId.arbitrumGoerli]: ETH_ADDRESS,
  [ChainId.arbitrumSepolia]: ETH_ADDRESS,
  [ChainId.bsc]: BNB_MAINNET_ADDRESS,
  [ChainId.bscTestnet]: BNB_MAINNET_ADDRESS,
  [ChainId.optimism]: ETH_ADDRESS,
  [ChainId.rari]: ETH_ADDRESS,
  [ChainId.hardhatOptimism]: ETH_ADDRESS,
  [ChainId.optimismSepolia]: ETH_ADDRESS,
  [ChainId.base]: ETH_ADDRESS,
  [ChainId.baseSepolia]: ETH_ADDRESS,
  [ChainId.zora]: ETH_ADDRESS,
  [ChainId.zoraSepolia]: ETH_ADDRESS,
  [ChainId.polygon]: MATIC_MAINNET_ADDRESS,
  [ChainId.polygonMumbai]: MATIC_MAINNET_ADDRESS,
  [ChainId.avalanche]: ETH_ADDRESS,
  [ChainId.avalancheFuji]: ETH_ADDRESS,
  [ChainId.blast]: ETH_ADDRESS,
  [ChainId.blastSepolia]: ETH_ADDRESS,
};

export const OVM_GAS_PRICE_ORACLE =
  '0x420000000000000000000000000000000000000F';

export const REFERRER = 'browser-extension';

export const LEGACY_CHAINS_FOR_HW = [
  ChainId.optimism,
  ChainId.arbitrum,
  ChainId.zora,
  ChainId.base,
];

export const SUPPORTED_MAINNET_CHAINS: Chain[] = [
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
  bsc,
  avalanche,
  chainBlast,
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
  goerli,
  sepolia,
  optimismSepolia,
  bscTestnet,
  polygonMumbai,
  arbitrumGoerli,
  arbitrumSepolia,
  baseSepolia,
  zoraSepolia,
  avalanche,
  avalancheFuji,
  chainBlast,
  chainBlastSepolia
].map((chain) => ({ ...chain, name: ChainNameDisplay[chain.id] }));

export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map((chain) => chain.id);

export const SUPPORTED_TESTNET_CHAINS: Chain[] = [
  holesky,
  goerli,
  sepolia,
  optimismSepolia,
  bscTestnet,
  polygonMumbai,
  arbitrumGoerli,
  arbitrumSepolia,
  baseSepolia,
  zoraSepolia,
  avalancheFuji,
  chainBlastSepolia
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
    case ChainId.goerli:
      return { http: process.env.ETH_GOERLI_RPC };
    case ChainId.sepolia:
      return { http: process.env.ETH_SEPOLIA_RPC };
    case ChainId.holesky:
      return { http: process.env.ETH_HOLESKY_RPC };
    case ChainId.optimismSepolia:
      return { http: process.env.OPTIMISM_SEPOLIA_RPC };
    case ChainId.bscTestnet:
      return { http: process.env.BSC_TESTNET_RPC };
    case ChainId.polygonMumbai:
      return { http: process.env.POLYGON_MUMBAI_RPC };
    case ChainId.arbitrumSepolia:
      return { http: process.env.ARBITRUM_SEPOLIA_RPC };
    case ChainId.arbitrumGoerli:
      return { http: process.env.ARBITRUM_GOERLI_RPC };
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
    default:
      return null;
  }
};
