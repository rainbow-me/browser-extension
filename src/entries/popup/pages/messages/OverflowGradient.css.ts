import { style } from '@vanilla-extract/css';

// surfaceSecondaryElevated

export const overflowGradient = style([
  {
    '::after': {
      content: '',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '38px',
      background: 'linear-gradient(180deg, transparent 0%, #242529 100%)',
    },
  },
]);
