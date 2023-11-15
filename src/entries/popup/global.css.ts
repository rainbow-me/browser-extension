import { globalStyle } from '@vanilla-extract/css';

import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';

globalStyle('html, body', {
  margin: 0,
  padding: 0,
  textRendering: 'optimizeLegibility',
  MozOsxFontSmoothing: 'grayscale',
  WebkitFontSmoothing: 'antialiased',
});

globalStyle('html, body, #main', {
  minWidth: `${POPUP_DIMENSIONS.width}px`,
  minHeight: `${POPUP_DIMENSIONS.height}px`,
  overscrollBehaviorY: 'none',
});

globalStyle('*', {
  boxSizing: 'border-box',
  transition: 'background 0.1s ease, color 0.03s ease',
  userSelect: 'none',
  scrollbarWidth: 'none',
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

globalStyle('#header-account-name-shuffle:focus-visible', {
  // transparent by default so we can set
  // the right color whenever we want to show the outline
  outline: '1px solid',
  outlineOffset: '2px',
  outlineColor: 'transparent',
});

globalStyle('.home-tab-wrapper:focus-visible', {
  // transparent by default so we can set
  // the right color whenever we want to show the outline
  outline: '1px solid',
  outlineOffset: '2px',
  outlineColor: 'transparent',
});

globalStyle('a:link, a:visited', {
  color: 'inherit',
});
