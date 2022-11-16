import { style, styleVariants } from '@vanilla-extract/css';

import { accentColorHslVars } from '../../styles/core.css';
import {
  ButtonColor,
  buttonColors,
  globalColors,
} from '../../styles/designTokens';

const getAccentColorAsHsl = ({ alpha }: { alpha?: number } = {}) =>
  `hsl(${[
    accentColorHslVars.hue,
    accentColorHslVars.saturation,
    accentColorHslVars.lightness,
    ...(alpha !== undefined ? [alpha] : []),
  ].join(', ')})`;

const buttonHeights = {
  '44px': 44,
  '36px': 36,
  '32px': 32,
  '28px': 28,
  '24px': 24,
} as const;
export type ButtonHeight = keyof typeof buttonHeights;

export const heightStyles = styleVariants(buttonHeights, (height) => [
  { height },
]);

export const interactionStyles = style({
  transition: '0.125s ease',
  ':hover': {
    transform: 'scale(1.05)',
  },
  ':active': {
    transform: 'scale(0.95)',
  },
});

export const tintedStyles = styleVariants({
  accent: {
    background: `${getAccentColorAsHsl({ alpha: 0.1 })} !important`,
  },
  ...(buttonColors.reduce((styles, color) => {
    if (color === 'accent') return styles;

    return {
      ...styles,
      [color]: { background: `${globalColors[`${color}A10`]} !important` },
    };
  }, {}) as Record<Exclude<ButtonColor, 'accent'>, { background: string }>),
});
