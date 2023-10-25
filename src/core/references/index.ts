import { AddressZero } from '@ethersproject/constants';
import { Address } from 'wagmi';

import { ChainId } from '~/core/types/chains';

import { AddressOrEth } from '../types/assets';

export { ethUnits } from './ethUnits';
export { gasUnits } from './gasUnits';
export { supportedCurrencies } from './supportedCurrencies';

export const smartContractMethods = {
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

// zora
export const ETH_ZORA_ADDRESS = AddressZero;

// bsc
export const BSC_BNB_ADDRESS = AddressZero;

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

export const NATIVE_ASSETS_PER_CHAIN: Record<ChainId, AddressOrEth> = {
  [ChainId.mainnet]: ETH_ADDRESS,
  [ChainId.hardhat]: ETH_ADDRESS,
  [ChainId.goerli]: ETH_ADDRESS,
  [ChainId.sepolia]: ETH_ADDRESS,
  [ChainId.arbitrum]: ETH_ARBITRUM_ADDRESS as Address,
  [ChainId['arbitrum-goerli']]: ETH_ARBITRUM_ADDRESS as Address,
  [ChainId.bsc]: BSC_BNB_ADDRESS as Address,
  [ChainId['bsc-testnet']]: BSC_BNB_ADDRESS as Address,
  [ChainId.optimism]: ETH_OPTIMISM_ADDRESS as Address,
  [ChainId.hardhatOptimism]: ETH_OPTIMISM_ADDRESS as Address,
  [ChainId['optimism-goerli']]: ETH_OPTIMISM_ADDRESS as Address,
  [ChainId.base]: ETH_BASE_ADDRESS as Address,
  [ChainId['base-goerli']]: ETH_BASE_ADDRESS as Address,
  [ChainId.zora]: ETH_ZORA_ADDRESS as Address,
  [ChainId['zora-testnet']]: ETH_ZORA_ADDRESS as Address,
  [ChainId.polygon]: MATIC_POLYGON_ADDRESS as Address,
  [ChainId['polygon-mumbai']]: MATIC_POLYGON_ADDRESS as Address,
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
