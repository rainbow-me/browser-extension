import { style } from '@vanilla-extract/css';

import { textStyles } from '~/design-system';

const fallbackTextBaseStyles = textStyles({
  fontWeight: 'bold',
  textAlign: 'center',
  color: 'label',
});

export const fallbackTextStyleExtraSmall = style([
  fallbackTextBaseStyles,
  { fontSize: '5pt' },
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
