import { Address } from 'wagmi';

import { ChainId, ChainName } from '~/core/types/chains';

import { ETH_ADDRESS } from '../references';

import { SearchAsset } from './search';

export interface ParsedAsset {
  address: AddressOrEth;
  chainId: ChainId;
  chainName: ChainName;
  colors?: {
    primary: string;
    fallback?: string;
    shadow?: string;
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

export type AddressOrEth = Address | 'eth';

// protocols https://github.com/rainbow-me/go-utils-lib/blob/master/pkg/enums/token_type.go#L44
export type ProtocolType =
  | 'aave-v2'
  | 'balancer'
  | 'curve'
  | 'compound'
  | 'compound-v3'
  | 'maker'
  | 'one-inch'
  | 'piedao-pool'
  | 'yearn'
  | 'yearn-v2'
  | 'uniswap-v2'
  | 'aave-v3'
  | 'harvest'
  | 'lido'
  | 'uniswap-v3'
  | 'convex'
  | 'convex-frax'
  | 'pancake-swap'
  | 'balancer-v2'
  | 'frax'
  | 'gmx'
  | 'aura'
  | 'pickle'
  | 'yearn-v3'
  | 'venus'
  | 'sushiswap';

export type AssetMetadata = {
  circulatingSupply: number;
  colors?: { primary: string; fallback?: string; shadow?: string };
  decimals: number;
  description: string;
  fullyDilutedValuation: number;
  iconUrl: string;
  marketCap: number;
  name: string;
  networks?: Record<ChainId, { address: AddressOrEth; decimals: number }>;
  price: {
    value: number;
    relativeChange24h: number;
  };
  symbol: string;
  totalSupply: number;
  volume1d: number;
};

export type UniqueId = `${Address}_${ChainId}`;
