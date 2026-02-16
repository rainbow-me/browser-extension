export { supportedCurrencies } from './supportedCurrencies';

export type {
  SupportedCurrency,
  SupportedCurrencyKey,
} from './supportedCurrencies';

export const ETH_ADDRESS = 'eth';
export const OP_ADDRESS = '0x4200000000000000000000000000000000000042';
export const DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f';

export const OVM_GAS_PRICE_ORACLE =
  '0x420000000000000000000000000000000000000F';

export type ReferrerType = 'browser-extension' | 'bx-claim';
export const REFERRER: ReferrerType = 'browser-extension';
export const REFERRER_CLAIM: ReferrerType = 'bx-claim';
