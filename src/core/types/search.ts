import { Address } from 'wagmi';

import { ParsedAsset, UniqueId } from './assets';
import { ChainId } from './chains';

export type TokenSearchAssetKey = keyof ParsedAsset;

export type TokenSearchThreshold = 'CONTAINS' | 'CASE_SENSITIVE_EQUAL';

export type TokenSearchListId =
  | 'highLiquidityAssets'
  | 'lowLiquidityAssets'
  | 'verifiedAssets';

export type SearchAsset = {
  address: Address;
  chainId: ChainId;
  colors: { primary: string; fallback: string };
  decimals: number;
  highLiquidity: boolean;
  icon_url: string;
  isRainbowCurated: boolean;
  isNativeAsset: boolean;
  isVerified: boolean;
  mainnetAddress: Address;
  name: string;
  networks: Record<ChainId, { address: Address; decimals: number }>;
  rainbowMetadataId: number;
  symbol: string;
  uniqueId: UniqueId;
};
