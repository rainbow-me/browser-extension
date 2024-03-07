import { i18n } from '../languages';

export function formatDate(date: string | number | Date) {
  const targetDate = new Date(date);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (today.toDateString() === targetDate.toDateString())
    return i18n.t('activity.today');
  if (yesterday.toDateString() === targetDate.toDateString())
    return i18n.t('activity.yesterday');

  return targetDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
