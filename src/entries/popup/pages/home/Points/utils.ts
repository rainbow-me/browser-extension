import { i18n } from '~/core/languages';

import {
  CATEGORY_DISPLAY_TYPE,
  CATEGORY_TYPE,
  EXISTING_USER_ERROR,
  INVALID_REFERRAL_CODE_ERROR,
} from './references';

export const getErrorString = (error: string) => {
  switch (error) {
    case EXISTING_USER_ERROR:
      return i18n.t('points.error.existing_user');
    case INVALID_REFERRAL_CODE_ERROR:
      return i18n.t('points.error.invalid_referral_code');
    default:
      return '';
  }
};

export const characterTypingTime = 0.1;

export const getDelayForRow = (rows: string[], row: number) => {
  const characters = rows.reduce((total, str, index) => {
    if (index <= row) {
      return total + str.length;
    }
    return total;
  }, 0);
  return characters * characterTypingTime;
};

export const getDelayForRows = (
  rows: string[][],
  row: number,
  column: number,
): number => {
  const delay = getDelayForRow(rows.flat(), row * 2 + column - 1);
  console.log(row, column, row * 2 + column - 1, delay);
  return delay;
};

export const DUMMY_USER = {
  categories: [
    {
      data: {
        owned_collections: 0,
        total_collections: 0,
        usd_amount: 1,
      },
      type: 'metamask-swaps' as CATEGORY_TYPE,
      display_type: 'USD_AMOUNT' as CATEGORY_DISPLAY_TYPE,
      earnings: { total: 0 },
    },
    {
      data: {
        owned_collections: 0,
        total_collections: 0,
        usd_amount: 1,
      },
      type: 'rainbow-bridges' as CATEGORY_TYPE,
      display_type: 'USD_AMOUNT' as CATEGORY_DISPLAY_TYPE,
      earnings: { total: 0 },
    },
    {
      data: {
        owned_collections: 1,
        total_collections: 10,
        usd_amount: 1,
      },
      type: 'nft-collections' as CATEGORY_TYPE,
      display_type: 'NFT_COLLECTION' as CATEGORY_DISPLAY_TYPE,
      earnings: { total: 0 },
    },
    {
      data: {
        owned_collections: 0,
        total_collections: 0,
        usd_amount: 1,
      },
      type: 'historic-balance' as CATEGORY_TYPE,
      display_type: 'USD_AMOUNT' as CATEGORY_DISPLAY_TYPE,
      earnings: { total: 0 },
    },
    {
      data: {
        owned_collections: 0,
        total_collections: 0,
        usd_amount: 1,
      },
      type: 'bonus' as CATEGORY_TYPE,
      display_type: 'BONUS' as CATEGORY_DISPLAY_TYPE,
      earnings: { total: 1 },
    },
    {
      data: {
        owned_collections: 0,
        total_collections: 0,
        usd_amount: 1,
      },
      type: 'rainbow-swaps' as CATEGORY_TYPE,
      display_type: 'USD_AMOUNT' as CATEGORY_DISPLAY_TYPE,
      earnings: { total: 0 },
    },
  ],
  earnings: { total: 100 },
};
