import { AddressZero } from '@ethersproject/constants';

import { ChainId } from '~/core/types/chains';

export { supportedCurrencies } from './supportedCurrencies';
export { ethUnits } from './ethUnits';

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
export const ETH_ADDRESS = 'eth';
export const OP_ADDRESS = '0x4200000000000000000000000000000000000042';
export const ARBITRUM_ETH_ADDRESS = AddressZero;
export const BNB_BSC_ADDRESS = AddressZero;
export const BNB_MAINNET_ADDRESS = '0xb8c77482e45f1f44de1745f52c74426c631bdd52';
export const OPTIMISM_ETH_ADDRESS = AddressZero;
export const MATIC_MAINNET_ADDRESS =
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0';
export const MATIC_POLYGON_ADDRESS =
  '0x0000000000000000000000000000000000001010';
export const NATIVE_ASSETS_PER_CHAIN = {
  [ChainId.arbitrum]: ARBITRUM_ETH_ADDRESS,
  [ChainId.bsc]: BNB_BSC_ADDRESS,
  [ChainId.mainnet]: ETH_ADDRESS,
  [ChainId.optimism]: OPTIMISM_ETH_ADDRESS,
  [ChainId.polygon]: MATIC_POLYGON_ADDRESS,
  [ChainId.hardhat]: ETH_ADDRESS,
};
export const OVM_GAS_PRICE_ORACLE =
  '0x420000000000000000000000000000000000000F';
