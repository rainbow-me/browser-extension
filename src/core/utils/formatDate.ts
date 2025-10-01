import { i18n } from '../languages';

export function formatExactDateTime(
  date: string | number | Date,
  locale?: string | string[],
): string {
  const d = new Date(date);
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeDate(date: string | number | Date): string {
  const targetDate = new Date(date);
  const now = new Date();

  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInMinutes = diffInMs / (1000 * 60);
  const diffInHours = diffInMs / (1000 * 60 * 60);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // "Just now" for under 5 minutes
  if (diffInMinutes < 5 && diffInMinutes >= 0) {
    return i18n.t('activity.just_now');
  }

  // "Last Hour" for under 1.05 hours
  if (today.toDateString() === targetDate.toDateString()) {
    if (diffInHours <= 1.05) {
      return i18n.t('activity.hour');
    }
    return i18n.t('activity.today');
  }

  if (yesterday.toDateString() === targetDate.toDateString()) {
    return i18n.t('activity.yesterday');
  }

  return targetDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
