import { i18n } from '../languages';
import { AutoLockTimerData, AutoLockTimerOption } from '../types/settings';

export const autoLockTimerOptions: {
  [key in AutoLockTimerOption]: AutoLockTimerData;
} = {
  immediately: {
    label: i18n.t('settings.privacy_and_security.auto_lock_timer.immediately'),
    mins: 0,
  },
  one_minute: {
    label: i18n.t('settings.privacy_and_security.auto_lock_timer.one_minute'),
    mins: 1,
  },
  five_minutes: {
    label: i18n.t('settings.privacy_and_security.auto_lock_timer.five_minutes'),
    mins: 5,
  },
  ten_minutes: {
    label: i18n.t('settings.privacy_and_security.auto_lock_timer.ten_minutes'),
    mins: 10,
  },
  fifteen_minutes: {
    label: i18n.t(
      'settings.privacy_and_security.auto_lock_timer.fifteen_minutes',
    ),
    mins: 15,
  },
  thirty_minutes: {
    label: i18n.t(
      'settings.privacy_and_security.auto_lock_timer.thirty_minutes',
    ),
    mins: 30,
  },
  one_hour: {
    label: i18n.t('settings.privacy_and_security.auto_lock_timer.one_hour'),
    mins: 60,
  },
  twelve_hours: {
    label: i18n.t('settings.privacy_and_security.auto_lock_timer.twelve_hours'),
    mins: 720,
  },
  twenty_four_hours: {
    label: i18n.t(
      'settings.privacy_and_security.auto_lock_timer.twenty_four_hours',
    ),
    mins: 1440,
  },
  none: {
    label: i18n.t('settings.privacy_and_security.auto_lock_timer.none'),
    mins: null,
  },
};
