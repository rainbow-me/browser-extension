import { style } from '@vanilla-extract/css';

export const childAStyle = style({
  display: 'none', // Default non-hover state
  selectors: {
    [`.approval-row:hover &`]: {
      display: 'block', // Display when parent is hovered
    },
  },
});

export const childBStyle = style({
  display: 'block', // Default non-hover state
  selectors: {
    [`.approval-row:hover &`]: {
      display: 'none', // Hide when parent is hovered
    },
  },
});
