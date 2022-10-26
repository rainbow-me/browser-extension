import { ChainName } from '../types/chains';

export { supportedCurrencies } from './supportedCurrencies';
export type {
  SupportedCurrency,
  SupportedCurrencyKey,
} from './supportedCurrencies';
export const ETH_ADDRESS = 'eth';
export const ARBITRUM_ETH_ADDRESS =
  '0x0000000000000000000000000000000000000000';
export const BNB_BSC_ADDRESS = '0x0000000000000000000000000000000000000000';
export const OPTIMISM_ETH_ADDRESS =
  '0x0000000000000000000000000000000000000000';
export const MATIC_MAINNET_ADDRESS =
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0';
export const MATIC_POLYGON_ADDRESS =
  '0x0000000000000000000000000000000000001010';
export const NATIVE_ASSETS_PER_NETWORK = {
  [ChainName.arbitrum]: ARBITRUM_ETH_ADDRESS,
  [ChainName.bsc]: BNB_BSC_ADDRESS,
  [ChainName.mainnet]: ETH_ADDRESS,
  [ChainName.optimism]: OPTIMISM_ETH_ADDRESS,
  [ChainName.polygon]: MATIC_POLYGON_ADDRESS,
};
