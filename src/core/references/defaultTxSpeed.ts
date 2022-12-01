import { DefaultTxSpeedData, DefaultTxSpeedOption } from '../types/settings';

export const defaultTxSpeedOptions: {
  [key in DefaultTxSpeedOption]: DefaultTxSpeedData;
} = {
  normal: { emoji: '⏱', label: 'Normal' },
  fast: { emoji: '🚀', label: 'Fast' },
  urgent: { emoji: '🚨', label: 'Urgent' },
};
