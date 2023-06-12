import { style } from '@vanilla-extract/css';

export const accountIndexHoverContainerStyle = style([]);

export const accountIndexHiddenHoverStyle = style([
  {
    opacity: 0,
    width: 5,
    overflow: 'hidden',
    transition: 'all .5s cubic-bezier(0.175, 0.885, 0.32, 1.3)',
    selectors: {
      [`${accountIndexHoverContainerStyle}:hover &`]: {
        opacity: 1,
        width: 31,
        transition: 'all .5s cubic-bezier(0.175, 0.885, 0.32, 1.18)',
      },
    },
  },
]);

export const accountIndexHiddenHoverSiblingStyle = style([
  {
    marginLeft: -5,
    selectors: {
      [`${accountIndexHoverContainerStyle}:hover &`]: {
        marginLeft: 0,
      },
    },
  },
]);
