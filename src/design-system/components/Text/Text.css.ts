import { style } from '@vanilla-extract/css';

import { accentColorAsHsl } from '../../styles/core.css';

export const selectionStyle = style({
  selectors: {
    '&::selection': {
      background: accentColorAsHsl,
      color: 'black',
    },
  },
});

export const accentShadow = style({
  color: '#0092FF',
  textShadow: '0px 0px 12px rgba(0, 146, 255, 0.60)',
});
