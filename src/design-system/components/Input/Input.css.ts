import { style, styleVariants } from '@vanilla-extract/css';

import {
  accentColorAsHsl,
  semanticColorVars,
  semiTransparentAccentColorAsHsl,
} from '../../styles/core.css';

export const backgroundStyle = style({
  // Have to apply this so that the border opacity applies to the parent background
  // rather than the input background.
  backgroundClip: 'padding-box',
  transition: 'border-color 100ms ease',
});

export const inputHeights = {
  '32px': 32,
  '34px': 34,
  '40px': 40,
  '44px': 44,
  '56px': 56,
} as const;
export type InputHeight = keyof typeof inputHeights;

export const heightStyles = styleVariants(inputHeights, (height) => [
  { height },
]);

export const placeholderStyle = style({
  '::placeholder': {
    color: semanticColorVars.foregroundColors.labelQuaternary,
  },
});

export const defaultCaretStyle = style({
  caretColor: semanticColorVars.foregroundColors.blue,
});

export const accentCaretStyle = style({
  caretColor: accentColorAsHsl,
});

export const accentSelectionStyle = style({
  '::selection': {
    background: semiTransparentAccentColorAsHsl,
  },
});
