import { Symbols } from '~/entries/popup/components/SFSymbol/SFSymbol';

export type AutoLockTimerOption =
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

export interface AutoLockTimerData {
  label: string;
  mins: number | null;
}

export type DefaultTxSpeedOption = 'normal' | 'fast' | 'urgent';

export interface DefaultTxSpeedData {
  emoji: string;
  label: string;
}

export type ThemeOption = 'light' | 'dark' | 'system';

export interface ThemeData {
  symbol: Symbols;
  label: string;
}
