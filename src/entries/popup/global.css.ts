import { globalStyle } from '@vanilla-extract/css';

globalStyle('html, body', {
  margin: 0,
  padding: 0,
});

globalStyle('html, body, #main', {
  width: '360px',
  height: '600px',
});

globalStyle('*', {
  transition: 'background 0.1s ease',
});
