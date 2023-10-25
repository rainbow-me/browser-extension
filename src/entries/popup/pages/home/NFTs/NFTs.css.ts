import { style } from '@vanilla-extract/css';

export const gradientBorderDark = style([
  {
    height: 26,
    borderRadius: 13,
    background:
      'linear-gradient(90deg, rgba(36, 37, 41, 1), rgba(36, 37, 41, 0.3), rgba(36, 37, 41, 0)) padding-box, linear-gradient(to right, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03), transparent) border-box',
    border: '1px solid transparent',
  },
]);

export const gradientBorderLight = style([
  {
    height: 26,
    borderRadius: 13,
    background:
      'linear-gradient(90deg, white, transparent) padding-box, linear-gradient(to right, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.03), transparent) border-box',
    border: '1px solid transparent',
  },
]);
