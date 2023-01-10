import { globalStyle } from '@vanilla-extract/css';

import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';

globalStyle('html, body', {
  margin: 0,
  padding: 0,
});

globalStyle('html, body, #main', {
  minWidth: `${POPUP_DIMENSIONS.width}px`,
  minHeight: `${POPUP_DIMENSIONS.height}px`,
  overscrollBehaviorY: 'none',
});

globalStyle('*', {
  boxSizing: 'border-box',
  transition: 'background 0.2s ease',
  userSelect: 'none',
  cursor: 'default !important',
});

globalStyle('*::-webkit-scrollbar', {
  display: 'none',
});

globalStyle('a', {
  textDecoration: 'none',
  cursor: 'pointer',
});

globalStyle('p', {
  userSelect: 'text',
});

globalStyle('div[data-radix-popper-content-wrapper]', {
  zIndex: '999 !important',
});

globalStyle('*:focus', {
  outline: 'none',
});
