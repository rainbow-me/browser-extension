import { style } from '@vanilla-extract/css';

import { transparentAccentColorAsHsl } from '~/design-system/styles/core.css';

export const RadioItemHighlightWrapper = style([
  {
    ':hover': {
      backgroundColor: transparentAccentColorAsHsl,
    },
  },
]);
