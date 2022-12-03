import { GasSpeed } from '../types/gas';

export const txSpeedEmoji = {
  [GasSpeed.CUSTOM]: '⚙️',
  [GasSpeed.NORMAL]: '⏱',
  [GasSpeed.FAST]: '🚀',
  [GasSpeed.URGENT]: '🚨',
};
