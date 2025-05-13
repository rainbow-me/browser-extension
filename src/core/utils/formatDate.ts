import { i18n } from '../languages';

export function formatDate(date: string | number | Date) {
  const targetDate = new Date(date);
  const now = new Date();

  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (today.toDateString() === targetDate.toDateString()) {
    // Allow a small buffer (e.g., 1.05 hours) to account for potential timing issues
    if (diffInHours <= 1.05) {
      return i18n.t('activity.hour');
    }
    return i18n.t('activity.today');
  }
  if (yesterday.toDateString() === targetDate.toDateString())
    return i18n.t('activity.yesterday');

  return targetDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
