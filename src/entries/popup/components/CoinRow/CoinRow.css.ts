import { style } from '@vanilla-extract/css';

import { boxStyles } from '~/design-system';
import { transparentAccentColorAsHsl } from '~/design-system/styles/core.css';

export const rowHighlightWrapperStyle = style([
  boxStyles({
    borderRadius: '12px',
  }),
  {
    ':hover': {
      backgroundColor: transparentAccentColorAsHsl,
    },
  },
]);
