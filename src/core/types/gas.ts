export enum GasSpeed {
  URGENT = 'urgent',
  FAST = 'fast',
  NORMAL = 'normal',
  CUSTOM = 'custom',
}

export interface GasFeeParam {
  amount: bigint;
  display: string;
  gwei: string;
}

export interface TransactionLegacyGasParams {
  gasPrice: bigint;
}

export interface GasFeeLegacyParams {
  gasPrice: GasFeeParam;
  option: GasSpeed;
  estimatedTime: { amount: number; display: string };
  display: string;
  transactionGasParams: TransactionLegacyGasParams;
  gasFee: { amount: bigint; display: string };
}

export type GasFeeLegacyParamsBySpeed = {
  [key in GasSpeed]: GasFeeLegacyParams;
};

export interface TransactionGasParams {
  maxPriorityFeePerGas: bigint;
  maxFeePerGas: bigint;
}

export interface GasFeeParams {
  maxBaseFee: GasFeeParam;
  maxPriorityFeePerGas: GasFeeParam;
  option: GasSpeed;
  estimatedTime: { amount: number; display: string };
  display: string;
  transactionGasParams: TransactionGasParams;
  gasFee: { amount: bigint; display: string };
}

export type GasFeeParamsBySpeed = {
  [key in GasSpeed]: GasFeeParams;
};

export const isEIP1559Gas = (
  gas: GasFeeParams | GasFeeLegacyParams,
): gas is GasFeeParams => 'maxBaseFee' in gas;

export const isLegacyGas = (
  gas: GasFeeParams | GasFeeLegacyParams,
): gas is GasFeeLegacyParams => 'gasPrice' in gas && !('maxBaseFee' in gas);

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
