import { Address } from 'wagmi';

import { ParsedAsset } from './assets';
import { ChainId } from './chains';

export type TokenSearchAssetKey = keyof ParsedAsset;

export type TokenSearchThreshold = 'CONTAINS' | 'CASE_SENSITIVE_EQUAL';

export type TokenSearchListId =
  | 'highLiquidityAssets'
  | 'lowLiquidityAssets'
  | 'verifiedAssets';

export type SearchAsset = {
  color: string;
  colors: { primary: string; fallback: string };
  decimals: number;
  highLiquidity: boolean;
  icon_url: string;
  isRainbowCurated: boolean;
  isVerified: boolean;
  name: string;
  networks: Record<ChainId, { address: Address; decimals: number }>;
  rainbowMetadataId: number;
  shadowColor: string;
  symbol: string;
  uniqueId: Address;
};
