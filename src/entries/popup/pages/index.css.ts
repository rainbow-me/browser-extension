import { style } from '@vanilla-extract/css';
import { boxStyles } from '~/design-system';

export const title = style({
  color: 'red',
});

export const button = style([
  boxStyles({
    padding: '10px',
  }),
  {
    background: 'black',
    color: 'white',
    borderRadius: 999,
  },
]);
