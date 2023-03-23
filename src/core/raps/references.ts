import { CrosschainQuote, Quote } from '@rainbow-me/swaps';
import { Address } from 'wagmi';

import { ParsedAsset } from '../types/assets';

export enum SwapModalField {
  input = 'inputAmount',
  native = 'nativeAmount',
  output = 'outputAmount',
}

export enum Source {
  AggregatorRainbow = 'rainbow',
  Aggregator0x = '0x',
  Aggregator1inch = '1inch',
}

export interface UnlockActionParameters {
  amount: string;
  assetToUnlock: ParsedAsset;
  contractAddress: Address;
  chainId: number;
}

export type SwapMetadata = {
  slippage: number;
  route: Source;
  inputAsset: ParsedAsset;
  outputAsset: ParsedAsset;
  independentField: SwapModalField;
  independentValue: string;
};

interface RapBaseSwapActionParameters {
  amount?: string | null;
  inputAmount: string;
  outputAmount: string;
  permit?: boolean;
  chainId: number;
  requiresApprove?: boolean;
  meta?: SwapMetadata;
  inputCurrency: ParsedAsset;
  outputCurrency: ParsedAsset;
}

export interface RapSwapActionParameters extends RapBaseSwapActionParameters {
  tradeDetails: Quote;
}

export interface RapCrosschainSwapActionParameters
  extends RapBaseSwapActionParameters {
  tradeDetails: CrosschainQuote;
}

export interface RapUnlockActionParameters {
  fromAddress: Address;
  assetToUnlock: ParsedAsset;
  contractAddress: Address;
  chainId: number;
}

export type RapActionParameters =
  | RapSwapActionParameters
  | RapCrosschainSwapActionParameters
  | RapUnlockActionParameters;

export interface RapActionTransaction {
  hash: string | null;
}

export interface RapAction {
  parameters: RapActionParameters;
  transaction: RapActionTransaction;
  type: RapActionTypes;
}

export interface Rap {
  actions: RapAction[];
}

export enum rapActions {
  swap = 'swap',
  crosschainSwap = 'crosschainSwap',
  unlock = 'unlock',
}

export type RapActionTypes = keyof typeof rapActions;
