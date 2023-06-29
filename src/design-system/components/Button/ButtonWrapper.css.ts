import { globalStyle, styleVariants } from '@vanilla-extract/css';

import { accentColorHslVars } from '../../styles/core.css';
import { ButtonColor, globalColors } from '../../styles/designTokens';

const getAccentColorAsHsl = ({ alpha }: { alpha?: number } = {}) =>
  `hsl(${[
    accentColorHslVars.hue,
    accentColorHslVars.saturation,
    accentColorHslVars.lightness,
    ...(alpha !== undefined ? [alpha] : []),
  ].join(', ')})`;

export const buttonHeights = {
  '44px': 44,
  '36px': 36,
  '32px': 32,
  '30px': 30,
  '28px': 28,
  '24px': 24,
} as const;
export type ButtonHeight = keyof typeof buttonHeights;

export const heightStyles = styleVariants(buttonHeights, (height) => [
  { height },
]);

export const tintedStyles = styleVariants<
  Record<ButtonColor, { background?: string }>
>({
  accent: {
    background: getAccentColorAsHsl({ alpha: 0.1 }),
  },
  blue: {
    background: globalColors.blueA10,
  },
  fill: {},
  green: {
    background: globalColors.greenA10,
  },
  fillSecondary: {},
  red: {
    background: globalColors.redA10,
  },
  orange: {
    background: globalColors.orangeA10,
  },
  yellow: {
    background: globalColors.yellowA10,
  },
  purple: {
    background: globalColors.purpleA10,
  },
  pink: {
    background: globalColors.pinkA10,
  },
  surfacePrimaryElevated: {},
  surfaceSecondaryElevated: {},
  surfacePrimaryElevatedSecondary: {},
});

globalStyle('.bx-button-wrapper button:focus-visible', {
  // transparent by default so we can set
  // the right color whenever we want to show the outline
  outline: '1px solid',
  outlineOffset: '2px',
  outlineColor: 'transparent',
});
