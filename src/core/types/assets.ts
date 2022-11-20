import { Address } from 'wagmi';

import { ChainId, ChainName } from '~/core/types/chains';

export interface ParsedAsset {
  address: Address;
  chainId: ChainId;
  chainName: ChainName;
  colors?: {
    primary: string;
    fallback?: string;
  };
  isNativeAsset: boolean;
  name: string;
  native: {
    price?: {
      change: string;
      amount: number;
      display: string;
    };
  };
  mainnetAddress?: Address;
  price?: ZerionAssetPrice;
  symbol: string;
  type: string;
  uniqueId: UniqueId;
}

export interface ParsedAddressAsset extends ParsedAsset {
  balance: {
    amount: string;
    display: string;
  };
  native: {
    balance: {
      amount: string;
      display: string;
    };
    price?: {
      change: string;
      amount: number;
      display: string;
    };
  };
}

export type ParsedAssetsDict = Record<UniqueId, ParsedAddressAsset>;

export type ParsedAssetsDictByChain = Record<ChainId, ParsedAssetsDict>;

export interface ZerionAssetPrice {
  value: number;
  relative_change_24h?: number;
  changed_at: number;
}

export enum AssetType {
  arbitrum = 'arbitrum',
  bsc = 'bsc',
  compound = 'compound',
  eth = 'eth',
  nft = 'nft',
  optimism = 'optimism',
  polygon = 'polygon',
  token = 'token',
  trash = 'trash',
  uniswap = 'uniswap',
  uniswapV2 = 'uniswap-v2',
}

export interface ZerionAsset {
  asset_code: Address;
  colors?: {
    primary: string;
    fallback: string;
  };
  implementations?: Record<string, { address: Address; decimals: number }>;
  mainnet_address?: Address;
  name: string;
  symbol: string;
  decimals: number;
  type?: AssetType;
  icon_url?: string;
  price?: ZerionAssetPrice;
  network?: ChainName;
}

export interface RainbowPrice {
  change: string;
  price: { amount?: number; display: string };
}

export interface RainbowPrices {
  [id: string]: RainbowPrice;
}

export type UniqueId = `${Address}_${ChainId}`;
