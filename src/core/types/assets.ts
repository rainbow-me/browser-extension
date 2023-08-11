import { Address } from 'wagmi';

import { ChainId, ChainName } from '~/core/types/chains';

import { ETH_ADDRESS } from '../references';

import { SearchAsset } from './search';

export interface ParsedAsset {
  address: Address | typeof ETH_ADDRESS;
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
  mainnetAddress?: Address | typeof ETH_ADDRESS;
  price?: ZerionAssetPrice;
  symbol: string;
  uniqueId: UniqueId;
  decimals: number;
  icon_url?: string;
  type: 'nft' | 'token';
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

export type SearchAssetWithPrice = SearchAsset & ParsedAsset;
export type ParsedSearchAsset = SearchAsset & ParsedAddressAsset;

export type ParsedAssetsDict = Record<UniqueId, ParsedAddressAsset>;

export type ParsedAssetsDictByChain = Record<ChainId, ParsedAssetsDict>;

export interface ZerionAssetPrice {
  value: number;
  relative_change_24h?: number;
  changed_at: number;
}

export interface ZerionAsset {
  asset_code: Address | typeof ETH_ADDRESS;
  colors?: {
    primary: string;
    fallback: string;
  };
  implementations?: Record<
    string,
    { address: Address | null; decimals: number }
  >;
  mainnet_address?: Address;
  name: string;
  symbol: string;
  decimals: number;
  type?: 'token' | 'nft';
  icon_url?: string;
  is_displayable?: boolean;
  is_verified?: boolean;
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
