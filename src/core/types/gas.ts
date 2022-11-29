export type GasSpeed = 'urgent' | 'fast' | 'normal' | 'custom';

export interface GasFeeParam {
  amount: string;
  display: string;
  gwei: string;
}

export interface GasFeeLegacyParams {
  gasPrice: GasFeeParam;
  option: string;
  estimatedTime: { amount: number; display: string };
  display: string;
}

export type GasFeeLegacyParamsBySpeed = {
  [key in GasSpeed]: GasFeeLegacyParams;
};

export interface GasFeeParams {
  maxBaseFee: GasFeeParam;
  maxPriorityFeePerGas: GasFeeParam;
  option: string;
  estimatedTime: { amount: number; display: string };
  display: string;
}

export type GasFeeParamsBySpeed = {
  [key in GasSpeed]: GasFeeParams;
};

export interface BlocksToConfirmationByPriorityFee {
  1: string;
  2: string;
  3: string;
  4: string;
}

export interface BlocksToConfirmationByBaseFee {
  4: string;
  8: string;
  40: string;
  120: string;
  240: string;
}

export interface BlocksToConfirmation {
  byBaseFee: BlocksToConfirmationByBaseFee;
  byPriorityFee: BlocksToConfirmationByPriorityFee;
}
