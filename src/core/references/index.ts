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

export const ETH_ADDRESS = 'eth';

export const OVM_GAS_PRICE_ORACLE =
  '0x420000000000000000000000000000000000000F';

export type ReferrerType = 'browser-extension' | 'bx-claim';
export const REFERRER: ReferrerType = 'browser-extension';
export const REFERRER_CLAIM: ReferrerType = 'bx-claim';
