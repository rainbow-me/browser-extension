import { i18n } from '~/core/languages';

import { EXISTING_USER_ERROR, INVALID_REFERRAL_CODE_ERROR } from './references';

export const CHARACTER_TYPING_SPEED = 0.02;

export const getErrorString = (error?: string | null) => {
  switch (error) {
    case EXISTING_USER_ERROR:
      return i18n.t('points.error.existing_user');
    case INVALID_REFERRAL_CODE_ERROR:
      return i18n.t('points.error.invalid_referral_code');
    default:
      return '';
  }
};

export const getDelayForRow = (rows: string[], row: number) => {
  const characters = rows.reduce((total, str, index) => {
    if (index <= row) {
      return total + str.length;
    }
    return total;
  }, 0);
  return characters * CHARACTER_TYPING_SPEED;
};

export const getDelayForRows = (
  rows: string[][],
  row: number,
  column: number,
): number => {
  const delay = getDelayForRow(rows.flat(), row * 2 + column - 1);
  return delay;
};
