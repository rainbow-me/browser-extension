export type TxDefaultSpeedType = 'normal' | 'fast' | 'urgent';

interface TxDefaultSpeedOption {
  emoji: string;
  label: string;
}

export const txDefaultSpeedOptions: {
  [key in TxDefaultSpeedType]: TxDefaultSpeedOption;
} = {
  normal: { emoji: '⏱', label: 'Normal' },
  fast: { emoji: '🚀', label: 'Fast' },
  urgent: { emoji: '🚨', label: 'Urgent' },
};
