import { style } from '@vanilla-extract/css';

import { boxStyles } from '~/design-system';
import { foregroundColors } from '~/design-system/styles/designTokens';

export const addressToInputHighlightWrapperStyleLight = style([
  boxStyles({
    borderRadius: '12px',
  }),
  {
    ':hover': {
      backgroundColor: foregroundColors.separatorTertiary.light,
    },
  },
]);

export const addressToInputHighlightWrapperStyleDark = style([
  boxStyles({
    borderRadius: '12px',
  }),
  {
    ':hover': {
      backgroundColor: foregroundColors.separatorTertiary.dark,
    },
  },
]);
