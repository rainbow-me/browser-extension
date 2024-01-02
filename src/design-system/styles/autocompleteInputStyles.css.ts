import { style } from '@vanilla-extract/css';

import { transparentAccentColorAsHsl } from './core.css';

export const selectedItem = style({
  transition: 'none',
  selectors: {
    '&[data-selected]': {
      backgroundColor: transparentAccentColorAsHsl,
      transition: 'none',
    },
  },
});
