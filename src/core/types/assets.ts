import { Address } from 'wagmi';

import { ChainName } from '~/core/types/chains';

export interface ParsedAddressAsset {
  address: string;
  balance: {
    amount: string;
    display: string;
  };
  chainName: ChainName;
  isNativeAsset: boolean;
  name: string;
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
  price?: ZerionAssetPrice;
  symbol: string;
  type: string;
  uniqueId: string;
}

export type ParsedAssetsDict = Record<Address, ParsedAddressAsset>;

export type ParsedAssetsDictByChain = Record<ChainName, ParsedAssetsDict>;

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
  asset_code: string;
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
