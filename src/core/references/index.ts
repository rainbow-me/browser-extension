import { AddressZero } from '@ethersproject/constants';

export { ethUnits } from './ethUnits';
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
export const POL_MAINNET_ADDRESS = '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6';
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
export const POL_POLYGON_ADDRESS = '0x0000000000000000000000000000000000001010';
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

// blast
export const ETH_BLAST_ADDRESS = AddressZero;
export const WETH_BLAST_ADDRESS = '0x4300000000000000000000000000000000000004';
export const USDB_BLAST_ADDRESS = '0x4300000000000000000000000000000000000003';

// degen
export const DEGEN_DEGEN_ADDRESS = AddressZero;

export const OVM_GAS_PRICE_ORACLE =
  '0x420000000000000000000000000000000000000F';

export type ReferrerType = 'browser-extension' | 'bx-claim';
export const REFERRER: ReferrerType = 'browser-extension';
export const REFERRER_CLAIM: ReferrerType = 'bx-claim';
