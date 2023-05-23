import { style } from '@vanilla-extract/css';

export const accountIndexHoverContainerStyle = style([]);

export const accountIndexHiddenHoverStyle = style([
  {
    width: 0,
    overflow: 'hidden',
    transition: 'all .5s cubic-bezier(0.175, 0.885, 0.32, 1.15)',
  },
  {
    selectors: {
      [`${accountIndexHoverContainerStyle}:hover &`]: {
        width: 31,
      },
    },
  },
]);
