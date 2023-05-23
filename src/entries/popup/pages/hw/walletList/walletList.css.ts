import { style } from '@vanilla-extract/css';

export const accountIndexHoverContainerStyle = style([]);

export const accountIndexHiddenHoverStyle = style([
  {
    maxWidth: 0,
    overflow: 'hidden',
    transition: 'all .5s',
  },
  {
    selectors: {
      [`${accountIndexHoverContainerStyle}:hover &`]: {
        maxWidth: 100,
      },
    },
  },
]);
