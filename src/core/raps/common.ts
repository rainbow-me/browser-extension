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

export enum RapActionType {
  swap = 'swap',
  unlock = 'unlock',
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
  inputAmount?: string | null;
  outputAmount?: string | null;
  permit?: boolean;
  chainId: number;
  requiresApprove?: boolean;
  meta?: SwapMetadata;
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

export interface RapActionTransaction {
  hash: string | null;
}

export interface RapSwapAction {
  parameters: RapSwapActionParameters | RapCrosschainSwapActionParameters;
  transaction: RapActionTransaction;
  type: RapActionType;
}

export interface Rap {
  actions: RapSwapAction[];
}
