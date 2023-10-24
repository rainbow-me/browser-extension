import { style } from '@vanilla-extract/css';

export const gradientBorder = style([
  {
    height: 26,
    borderRadius: 13,
    background:
      'linear-gradient(90deg, rgba(36, 37, 41, 1), rgba(36, 37, 41, 0.3), rgba(36, 37, 41, 0)) padding-box, linear-gradient(to right, rgba(255, 255, 255, 0.06), transparent) border-box',
    border: '1px solid transparent',
  },
]);
