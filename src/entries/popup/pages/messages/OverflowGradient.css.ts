import { style } from '@vanilla-extract/css';

import { backgroundColors } from '~/design-system/styles/designTokens';

export const overflowGradientDark = style([
  {
    '::after': {
      content: '',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '38px',
      background: `linear-gradient(180deg, transparent 0%, ${backgroundColors.surfaceSecondaryElevated.dark.color} 100%)`,
    },
  },
]);

export const overflowGradientLight = style([
  {
    '::after': {
      content: '',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '38px',
      background: `linear-gradient(180deg, transparent 0%, ${backgroundColors.surfaceSecondaryElevated.light.color} 100%)`,
    },
  },
]);
