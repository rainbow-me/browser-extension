import { constants } from 'ethers';

import { ChainName } from '~/core/types/chains';

export { supportedCurrencies } from './supportedCurrencies';
export { ethUnits } from './ethUnits';

export { default as optimismGasOracleAbi } from './abis/optimism-gas-oracle-abi.json';

export type {
  SupportedCurrency,
  SupportedCurrencyKey,
} from './supportedCurrencies';
export const ETH_ADDRESS = 'eth';
export const ARBITRUM_ETH_ADDRESS = constants.AddressZero;
export const BNB_BSC_ADDRESS = constants.AddressZero;
export const BNB_MAINNET_ADDRESS = '0xb8c77482e45f1f44de1745f52c74426c631bdd52';
export const OPTIMISM_ETH_ADDRESS = constants.AddressZero;
export const MATIC_MAINNET_ADDRESS =
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0';
export const MATIC_POLYGON_ADDRESS =
  '0x0000000000000000000000000000000000001010';
export const NATIVE_ASSETS_PER_CHAIN = {
  [ChainName.arbitrum]: ARBITRUM_ETH_ADDRESS,
  [ChainName.bsc]: BNB_BSC_ADDRESS,
  [ChainName.mainnet]: ETH_ADDRESS,
  [ChainName.optimism]: OPTIMISM_ETH_ADDRESS,
  [ChainName.polygon]: MATIC_POLYGON_ADDRESS,
};
export const OVM_GAS_PRICE_ORACLE =
  '0x420000000000000000000000000000000000000F';
