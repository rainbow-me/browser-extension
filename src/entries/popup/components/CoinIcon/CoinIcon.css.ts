import { style } from '@vanilla-extract/css';

import { textStyles } from '~/design-system';

const fallbackTextBaseStyles = textStyles({
  color: 'labelWhite',
  fontFamily: 'rounded',
  fontWeight: 'bold',
  textAlign: 'center',
});

export const fallbackTextStyleTiny = style([
  fallbackTextBaseStyles,
  { fontSize: '3pt', fontWeight: 'heavy' },
]);

export const fallbackTextStyleXXSmall = style([
  fallbackTextBaseStyles,
  { fontSize: '4pt', fontWeight: 'heavy' },
]);

export const fallbackTextStyleXSmall = style([
  fallbackTextBaseStyles,
  { fontSize: '5pt', fontWeight: 'heavy' },
]);

export const fallbackTextStyleSmall = style([
  fallbackTextBaseStyles,
  { fontSize: '6pt' },
]);

export const fallbackTextStyleMedium = style([
  fallbackTextBaseStyles,
  { fontSize: '7pt' },
]);

export const fallbackTextStyleLarge = style([
  fallbackTextBaseStyles,
  { fontSize: '9pt' },
]);

export const fallbackTextStyleExtraLarge = style([
  fallbackTextBaseStyles,
  { fontSize: '11pt' },
]);
