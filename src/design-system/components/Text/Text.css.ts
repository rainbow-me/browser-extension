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
