import { style } from '@vanilla-extract/css';
import { textStyles } from '../../styles/core.css';

export const textLink = style([
  textStyles({ color: 'accent' }),
  {
    textUnderlinePosition: 'from-font',
    ':hover': {
      textDecoration: 'underline',
    },
  },
]);
