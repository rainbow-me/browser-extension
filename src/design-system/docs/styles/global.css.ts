import { globalStyle } from '@vanilla-extract/css';

globalStyle('html, body', {
  boxSizing: 'border-box',
  margin: 0,
  MozOsxFontSmoothing: 'grayscale',
  padding: 0,
  textRendering: 'optimizeLegibility',
  WebkitFontSmoothing: 'antialiased',
  WebkitTextSizeAdjust: '100%',
});