import { style } from '@vanilla-extract/css';
import { boxStyles } from '~/design-system';

export const title = style({
  color: 'red',
});

export const button = style([
  boxStyles({
    padding: '16px',
  }),
  {
    borderRadius: 999,
  },
]);
