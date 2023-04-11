import { style } from '@vanilla-extract/css';

import {
  accentColorAsHsl,
  transparentAccentColorAsHsl,
} from '../../styles/core.css';

export const focusVisibleStyle = style({
  selectors: {
    '&:focus': {
      backgroundColor: transparentAccentColorAsHsl,
      outline: '1px solid',
      outlineColor: accentColorAsHsl,
    },
  },
});

export const menuFocusVisibleStyle = style({
  selectors: {
    '&:focus': {
      backgroundColor: transparentAccentColorAsHsl,
    },
  },
});
