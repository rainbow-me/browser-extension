import { style } from '@vanilla-extract/css';

import { transparentAccentColorAsHsl } from '~/design-system/styles/core.css';

export const rowTransparentAccentHighlight = style([
  {
    ':hover': {
      backgroundColor: transparentAccentColorAsHsl,
    },
  },
]);
