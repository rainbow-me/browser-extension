export type DefaultTxSpeedType = 'normal' | 'fast' | 'urgent';

interface DefaultTxSpeedOption {
  emoji: string;
  label: string;
}

export const defaultTxSpeedOptions: {
  [key in DefaultTxSpeedType]: DefaultTxSpeedOption;
} = {
  normal: { emoji: '⏱', label: 'Normal' },
  fast: { emoji: '🚀', label: 'Fast' },
  urgent: { emoji: '🚨', label: 'Urgent' },
};
