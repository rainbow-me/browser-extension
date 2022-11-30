export type AutoLockTimerOptionType =
  | 'immediately'
  | 'one_minute'
  | 'five_minutes'
  | 'ten_minutes'
  | 'fifteen_minutes'
  | 'thirty_minutes'
  | 'one_hour'
  | 'twelve_hours'
  | 'twenty_four_hours'
  | 'none';

interface AutoLockTimerOption {
  label: string;
  mins: number | null;
}

export const autoLockTimerOptions: {
  [key in AutoLockTimerOptionType]: AutoLockTimerOption;
} = {
  immediately: {
    label: 'Immediately',
    mins: 0,
  },
  one_minute: {
    label: '1 minute',
    mins: 1,
  },
  five_minutes: {
    label: '5 minutes',
    mins: 5,
  },
  ten_minutes: {
    label: '10 minutes',
    mins: 10,
  },
  fifteen_minutes: {
    label: '15 minutes',
    mins: 15,
  },
  thirty_minutes: {
    label: '30 minutes',
    mins: 30,
  },
  one_hour: {
    label: '1 hour',
    mins: 60,
  },
  twelve_hours: {
    label: '12 hours',
    mins: 720,
  },
  twenty_four_hours: {
    label: '24 hours',
    mins: 1440,
  },
  none: {
    label: 'None',
    mins: null,
  },
};
