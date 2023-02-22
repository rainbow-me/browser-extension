import { TextStyles } from '~/design-system/styles/core.css';
import { SymbolName } from '~/design-system/styles/designTokens';

import { GasSpeed } from './gas';

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

export type DefaultTxSpeedOption =
  | GasSpeed.NORMAL
  | GasSpeed.FAST
  | GasSpeed.URGENT;

export type ThemeOption = 'light' | 'dark' | 'system';

export interface ThemeData {
  symbol: SymbolName;
  label: string;
  color: TextStyles['color'];
}
