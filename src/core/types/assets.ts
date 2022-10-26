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
}
