import { ChainName } from './chains';

export type PolygonAllowlist = Record<string, boolean>;

export interface PolygonAllowListDictionary {
  [key: string]: boolean;
}

export enum SimpleHashChain {
  Arbitrum = 'arbitrum',
  Bsc = 'bsc',
  Ethereum = 'ethereum',
  Gnosis = 'gnosis',
  Optimism = 'optimism',
  Polygon = 'polygon',
  Zora = 'zora',
  Base = 'base',
}

/**
 * @see https://docs.simplehash.com/reference/sale-model
 */
export enum SimpleHashMarketplaceId {
  Blur = 'blur',
  LooksRare = 'looksrare',
  OpenSea = 'opensea',
  X2Y2 = 'x2y2',
}

// the string is either the ERC20 contract address or "native" if it's ETH
type SimpleHashPaymentTokenId = `ethereum.${string}`;

export type SimpleHashTrait = {
  trait_type: string;
  value: string | number;
  display_type: string | null;
};

type SimpleHashRarity = {
  rank: number | null;
  score: number | null;
  unique_attributes: number | null;
};

type SimpleHashPaymentToken = {
  payment_token_id: SimpleHashPaymentTokenId;
  name: string | null;
  symbol: string | null;
  address: string | null;
  decimals: number;
};

export type SimpleHashListing = {
  id: string;
  permalink: string;
  bundle_item_number: number | null;
  listing_timestamp: string;
  expiration_timestamp: string;
  seller_address: string;
  auction_type: string | null;
  quantity: number;
  quantity_remaining: number;
  price: number;
  marketplace_id: SimpleHashMarketplaceId;
  collection_id: string | null;
  nft_id: string;
  payment_token: SimpleHashPaymentToken | null;
};

export type SimpleHashFloorPrice = {
  marketplace_id: SimpleHashMarketplaceId;
  value: number;
  payment_token: SimpleHashPaymentToken;
};

export type SimpleHashMarketplace = {
  marketplace_id: SimpleHashMarketplaceId;
  marketplace_name: string;
  marketplace_collection_id: string;
  nft_url: string;
  collection_url: string;
  verified: boolean | null;
};

export type SimpleHashCollection = {
  collection_id: string | null;
  name: string | null;
  description: string | null;
  image_url: string | null;
  banner_image_url: string | null;
  external_url: string | null;
  twitter_username: string | null;
  discord_url: string | null;
  marketplace_pages: SimpleHashMarketplace[];
  metaplex_mint: string | null;
  metaplex_first_verified_creator: string | null;
  spam_score: number | null;
  floor_prices: SimpleHashFloorPrice[];
  top_contracts: string[];
};

export interface SimpleHashCollectionDetails {
  collection_id: string;
  distinct_nft_count: number;
  distinct_owner_count: number;
  total_copies_owned?: number;
  total_copies_owned_string?: string;
  last_acquired_date?: string;

  collection_details: {
    banner_image_url: string;
    category: null;
    chains: string[];
    description: string;
    discord_url: string;
    external_url: string;
    floor_prices: SimpleHashFloorPrice[];
    image_url: string;
    instagram_username: null;
    is_nsfw: boolean;
    marketplace_pages: SimpleHashMarketplace[];
    medium_username: null;
    metaplex_first_verified_creator: null;
    metaplex_mint: null;
    name: string;
    spam_score: number;
    telegram_url: null;
    top_contracts: string[];
    total_quantity: number;
    twitter_username: string;
    distinct_nfts_owned?: number;
    distinct_nfts_owned_string?: string;
  };
}

/**
 * @see https://docs.simplehash.com/reference/nft-model
 */
export type SimpleHashNFT = {
  nft_id: string;
  chain: SimpleHashChain;
  contract_address: string;
  token_id: string | null;
  name: string | null;
  description: string | null;
  previews: {
    image_small_url: string | null;
    image_medium_url: string | null;
    image_large_url: string | null;
    image_opengraph_url: string | null;
    blurhash: string | null;
    predominant_color: string | null;
  };
  image_url: string | null;
  image_properties: {
    width: number | null;
    height: number | null;
    size: number | null;
    mime_type: string | null;
  } | null;
  video_url: string | null;
  video_properties: {
    width: number | null;
    height: number | null;
    duration: number | null;
    video_coding: string | null;
    audio_coding: string | null;
    size: number | string;
    mime_type: string | null;
  } | null;
  audio_url: string | null;
  audio_properties: {
    duration: number | null;
    audio_coding: string | null;
    size: number | string;
    mime_type: string | null;
  } | null;
  model_url: string | null;
  model_properties: {
    size: number | null;
    mime_type: string | null;
  } | null;
  background_color: string | null;
  external_url: string | null;
  created_date: string | null;
  status: string;
  token_count: number | null;
  owner_count: number | null;
  owners: {
    owner_address: string;
    quantity: number;
    first_acquired_date: string;
    last_acquired_date: string;
  }[];
  last_sale: {
    from_address: string | null;
    to_address: string | null;
    quantity: number | null;
    timestamp: string;
    transaction: string;
    marketplace_id: SimpleHashMarketplaceId;
    marketplace_name: string;
    is_bundle_sale: boolean;
    payment_token: SimpleHashPaymentToken | null;
    unit_price: number | null;
    total_price: number | null;
  } | null;
  first_created: {
    minted_to: string | null;
    quantity: number | null;
    timestamp: string | null;
    block_number: number | null;
    transaction: string | null;
    transaction_initiator: string | null;
  } | null;
  contract: {
    type: string;
    name: string | null;
    symbol: string | null;
    deployed_by: string | null;
    deployed_via: string | null;
  };
  collection: SimpleHashCollection;
  rarity: SimpleHashRarity;
  extra_metadata: {
    image_original_url: string | null;
    animation_original_url: string | null;
    attributes: SimpleHashTrait[] | null | undefined;
  };
};

export type ValidatedSimpleHashNFT = Omit<
  SimpleHashNFT,
  'name' | 'chain' | 'collection' | 'contract_address' | 'token_id'
> & {
  name: string;
  chain: ChainName;
  collection: Omit<SimpleHashCollection, 'name'> & { name: string };
  contract_address: string;
  token_id: string;
};

export const uniqueTokenTypes = {
  ENS: 'ENS',
  NFT: 'NFT',
  POAP: 'POAP',
} as const;
export type UniqueTokenType = keyof typeof uniqueTokenTypes;

export const uniqueTokenFormats = {
  '3d': '3d',
  audio: 'audio',
  image: 'image',
  video: 'video',
} as const;
export type UniqueTokenFormat = keyof typeof uniqueTokenFormats;

interface UniqueAssetLastSale {
  total_price: string;
  payment_token?: {
    symbol: string;
    usd_price: string;
  };
}

export interface UniqueAsset {
  animation_url?: string | null;
  description?: string | null;
  external_link?: string | null;
  image_original_url?: string | null;
  image_preview_url?: string | null;
  image_thumbnail_url?: string | null;
  image_url?: string | null;
  last_sale?: UniqueAssetLastSale | null;
  name: string;
  permalink: string;
  traits: UniqueAssetTrait[];
  asset_contract: {
    address?: string;
    name?: string;
    nft_version?: string;
    schema_name?: string;
    symbol?: string;
    total_supply?: number | null;
  };
  background: string | null;
  collection: {
    collection_id?: string | null;
    description?: string | null;
    discord_url?: string | null;
    external_url?: string | null;
    featured_image_url?: string | null;
    hidden?: boolean | null;
    image_url?: string | null;
    name: string;
    short_description?: string | null;
    slug: string;
    twitter_username?: string | null;
    wiki_link?: string | null;
  };
  familyImage: string | null | undefined;
  familyName: string | null | undefined;
  floorPriceEth?: string | undefined;
  id: string;
  isSendable: boolean;
  lastSalePaymentToken: string | undefined | null;
  lowResUrl: string | null;
  marketplaceCollectionUrl?: string | null;
  marketplaceId: string | null;
  marketplaceName: string | null;
  uniqueId: string;
  /**
   * @description a computed unique value comprised of <network>_<address>_<token_id>
   */
  fullUniqueId: string;
  urlSuffixForAsset: string;
  isPoap?: boolean;
  network: ChainName;
  predominantColor?: string;
  video_url: string | null;
  video_properties: {
    width: number | null;
    height: number | null;
    duration: number | null;
    video_coding: string | null;
    audio_coding: string | null;
    size: number | string;
    mime_type: string | null;
  } | null;
  audio_url: string | null;
  audio_properties: {
    duration: number | null;
    audio_coding: string | null;
    size: number | string;
    mime_type: string | null;
  } | null;
  model_url: string | null;
  model_properties: {
    size: number | null;
    mime_type: string | null;
  } | null;
}

export interface UniqueAssetTrait {
  trait_type?: string | null;
  value?: string | number | null | undefined;
  display_type?: string | null;
  max_value?: string | number | null | undefined;
}
