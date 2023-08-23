import { format } from 'date-fns';

import { i18n } from '../languages';
import { RainbowTransaction } from '../types/transactions';

import { getLocale } from './locales';

export const calculateTimestampOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const calculateTimestampOfYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const calculateTimestampOfThisMonth = () => {
  const d = new Date();
  d.setDate(0);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const calculateTimestampOfThisYear = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear(), 0, 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const todayTimestamp = calculateTimestampOfToday();
export const yesterdayTimestamp = calculateTimestampOfYesterday();
export const thisMonthTimestamp = calculateTimestampOfThisMonth();
export const thisYearTimestamp = calculateTimestampOfThisYear();

export const groupTransactionByDate = ({
  minedAt,
  status,
}: RainbowTransaction) => {
  if (status === 'pending' || !minedAt) return i18n.t('activity.today');
  const ts = minedAt * 1000;

  if (ts > todayTimestamp) return i18n.t('activity.today');
  if (ts > yesterdayTimestamp) return i18n.t('activity.yesterday');
  if (ts > thisMonthTimestamp) return i18n.t('activity.this_month');
  try {
    return format(ts, `MMMM${ts > thisYearTimestamp ? '' : ' yyyy'}`, {
      locale: getLocale(),
    });
  } catch (e) {
    return 'Dropped';
  }
};
