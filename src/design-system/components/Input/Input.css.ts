import { style, styleVariants } from '@vanilla-extract/css';

import { semanticColorVars } from '../../styles/core.css';

export const backgroundStyle = style({
  // Have to apply this so that the border opacity applies to the parent background
  // rather than the input background.
  backgroundClip: 'padding-box',
});

export const inputHeights = {
  '34px': 34,
  full: '100%',
} as const;
export type InputHeight = keyof typeof inputHeights;

export const heightStyles = styleVariants(inputHeights, (height) => [
  { height },
]);

export const placeholderStyle = style({
  '::placeholder': {
    color: semanticColorVars.foregroundColors.labelTertiary,
  },
});
