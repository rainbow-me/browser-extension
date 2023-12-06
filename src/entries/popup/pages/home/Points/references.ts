export const INVALID_REFERRAL_CODE_ERROR = 'INVALID_REFERRAL_CODE';
export const EXISTING_USER_ERROR = 'EXISTING_USER';

export type CATEGORY_TYPE =
  | 'rainbow-swaps'
  | 'metamask-swaps'
  | 'rainbow-bridges'
  | 'nft-collections'
  | 'historic-balance'
  | 'bonus';

export type CATEGORY_DISPLAY_TYPE = 'USD_AMOUNT' | 'NFT_COLLECTION' | 'BONUS';

export interface USER_POINTS_CATEGORY {
  data: {
    usd_amount: number;
    total_collections: number;
    owned_collections: number;
  };
  type: CATEGORY_TYPE;
  display_type: CATEGORY_DISPLAY_TYPE;
  earnings: {
    total: number;
  };
}

export interface USER_POINTS_ONBOARDING {
  earnings: {
    total: number;
  };
  categories: USER_POINTS_CATEGORY[];
}
