import { style } from '@vanilla-extract/css';

import { semanticColorVars } from '~/design-system/styles/core.css';

export const dropdownMenuItemStyles = style({
  selectors: {
    '&[data-highlighted]': {
      backgroundColor: semanticColorVars.backgroundColors.surfaceSecondary,
    },
    '&[data-state=checked]': {
      backgroundColor: semanticColorVars.backgroundColors.blue,
    },
  },
});
