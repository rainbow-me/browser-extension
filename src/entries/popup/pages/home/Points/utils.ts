import { PointsQuery } from '~/core/graphql/__generated__/metadata';
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
      return i18n.t('points.error.unexpected');
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
  const delay =
    getDelayForRow(rows.flat(), row * 2 + column - 1) +
    (column % 2 !== 0 ? 0.5 : 0) +
    1 * row;
  return delay;
};

export const RAINBOW_TEXT = {
  row1: '\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\',
  row2: '\u00A0\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\',
  row3: '\u00A0\u00A0\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\',
  row4: '\u00A0\u00A0\u00A0\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\',
  row5: '\u00A0\u00A0\u00A0\u00A0\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\',
  row6: '\u00A0\u00A0\u00A0\u00A0\u00A0\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\',
  row7: '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\',
  row8: '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\',
};
export const RAINBOW_TEXT_WELCOME = {
  row1: 'WELCOME TO POINTS',
};

export type WeeklyEarning = {
  type:
    | 'new_referrals'
    | 'referral_activity'
    | 'redemption'
    | 'retroactive'
    | 'transaction'
    // eslint-disable-next-line @typescript-eslint/ban-types
    | (string & {});
  earnings: number;
};

export const getWeeklyEarnings = (points: PointsQuery['points']) => {
  const differences = points?.user.stats.last_airdrop.differences;
  if (!differences) return null;

  let total = 0;
  const rewardsByType: Record<string, WeeklyEarning> = {};
  for (const diff of differences) {
    if (!diff) continue;
    const type = diff.type === 'referral' ? diff.group_id : diff.type;
    rewardsByType[type] = {
      type,
      earnings: (rewardsByType[type]?.earnings || 0) + diff.earnings.total,
    };
    total += diff.earnings.total;
  }

  const diffs = Object.values(rewardsByType).filter(
    (d) =>
      !(['retroactive', 'redemption'].includes(d.type) && d.earnings === 0),
  );

  return { total, differences: diffs };
};

export const getEarningTypeLabel = (type: WeeklyEarning['type']) => {
  if (type === 'transaction')
    return i18n.t('points.weekly_overview.your_activity');
  if (type === 'referral_activity')
    return i18n.t('points.weekly_overview.referral_activity');
  if (type === 'new_referrals')
    return i18n.t('points.weekly_overview.new_referrals');
  if (type === 'redemption') return i18n.t('points.weekly_overview.bonus');
  if (type === 'retroactive')
    return i18n.t('points.weekly_overview.retroactive');
  return type;
};

export function getRankDifference(
  stats: NonNullable<PointsQuery['points']>['user']['stats'],
) {
  const lastWeekRank = stats.last_airdrop.position.current;
  const currentRank = stats.position.current;
  const difference = currentRank - lastWeekRank;

  if (difference === 0)
    return {
      symbol: 'chart.line.flattrend.xyaxis',
      color: 'yellow',
      difference,
    } as const;

  if (difference < 0)
    return {
      symbol: 'chart.line.uptrend.xyaxis',
      color: 'green',
      difference,
    } as const;

  return {
    symbol: 'chart.line.downtrend.xyaxis',
    color: 'red',
    difference,
  } as const;
}
