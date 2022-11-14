import { globalStyle } from '@vanilla-extract/css';

globalStyle('html, body', {
  margin: 0,
  padding: 0,
});

globalStyle('html, body, #main', {
  minWidth: '360px',
});

globalStyle('*', {
  transition: 'background 0.1s ease',
});

globalStyle('*::-webkit-scrollbar', {
  display: 'none',
});

globalStyle('div[data-radix-popper-content-wrapper]', {
  zIndex: '999 !important',
});
