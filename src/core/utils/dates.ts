import { format } from 'date-fns';

import { RainbowTransaction } from '../types/transactions';

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
  pending,
}: RainbowTransaction) => {
  if (pending) return 'Today';
  if (!minedAt) return 'Dropped';
  const ts = minedAt * 1000;

  if (ts > todayTimestamp) return 'Today';
  if (ts > yesterdayTimestamp) return 'Yesterday';
  if (ts > thisMonthTimestamp) return 'This Month';
  try {
    return format(ts, `MMMM${ts > thisYearTimestamp ? '' : ' yyyy'}`);
  } catch (e) {
    return 'Dropped';
  }
};
