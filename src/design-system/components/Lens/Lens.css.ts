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
      outlineOffset: '2px',
      outlineColor: accentColorAsHsl,
      outlineStyle: 'solid',
    },
  },
});
