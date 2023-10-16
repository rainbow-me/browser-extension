import { style } from '@vanilla-extract/css';

import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';

export const appContainer = style({
  position: 'relative',
  border: '2px solid red',
  background: 'transparent',
  pointerEvents: 'auto',
  zIndex: 1000000000000000,
  height: POPUP_DIMENSIONS.height,
  //   backgroundColor: 'green',

  //   '::before': {
  //     content: '""',
  //     position: 'absolute',
  //     top: '-2px',
  //     left: '-2px',
  //     right: '-2px',
  //     bottom: '-2px',
  //     border: 'inherit',
  //     pointerEvents: 'auto',
  //   },
});
