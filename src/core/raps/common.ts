import { Quote } from '@rainbow-me/swaps';
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
  flashbots: boolean;
  slippage: number;
  route: Source;
  inputAsset: ParsedAsset;
  outputAsset: ParsedAsset;
  independentField: SwapModalField;
  independentValue: string;
};

export interface RapExchangeActionParameters {
  amount?: string | null;
  assetToUnlock?: ParsedAsset;
  contractAddress?: string;
  inputAmount?: string | null;
  outputAmount?: string | null;
  tradeDetails?: Quote;
  permit?: boolean;
  flashbots?: boolean;
  chainId?: number;
  requiresApprove?: boolean;
  meta?: SwapMetadata;
}

export interface RapActionTransaction {
  hash: string | null;
}

export interface RapSwapAction {
  parameters: RapExchangeActionParameters;
  transaction: RapActionTransaction;
  type: RapActionType;
}

export interface Rap {
  actions: RapSwapAction[];
}
