import { globalStyle } from '@vanilla-extract/css';

globalStyle('html, body', {
  margin: 0,
  padding: 0,
});

globalStyle('html, body, #main', {
  minWidth: '360px',
  minHeight: '600px',
});

globalStyle('*', {
  boxSizing: 'border-box',
  transition: 'background 0.1s ease',
});

globalStyle('*::-webkit-scrollbar', {
  display: 'none',
});

globalStyle('a', {
  textDecoration: 'none',
  cursor: 'default',
});

globalStyle('div[data-radix-popper-content-wrapper]', {
  zIndex: '999 !important',
});
