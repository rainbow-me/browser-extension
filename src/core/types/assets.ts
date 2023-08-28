import { Address } from 'wagmi';

import { ChainId, ChainName } from '~/core/types/chains';

import { ETH_ADDRESS } from '../references';

import { SearchAsset } from './search';

export type AddressOrEth = Address | typeof ETH_ADDRESS;

export interface ParsedAsset {
  address: AddressOrEth;
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
  mainnetAddress?: AddressOrEth;
  price?: ZerionAssetPrice;
  symbol: string;
  uniqueId: UniqueId;
  decimals: number;
  icon_url?: string;
  smallBalance?: boolean;
}

export interface ParsedUserAsset extends ParsedAsset {
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
export type ParsedSearchAsset = SearchAsset & ParsedUserAsset;

export type ParsedAssetsDict = Record<UniqueId, ParsedUserAsset>;

export type ParsedAssetsDictByChain = Record<ChainId, ParsedAssetsDict>;

export interface ZerionAssetPrice {
  value: number;
  relative_change_24h?: number;
  changed_at: number;
}

export type AssetType = 'nft' | 'token';

export interface ZerionAsset {
  asset_code: Address;
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
  type?: AssetType;
  icon_url?: string;
  is_displayable?: boolean;
  is_verified?: boolean;
  price?: ZerionAssetPrice;
  network?: ChainName;
}

export type UniqueId = `${Address}_${ChainId}`;
