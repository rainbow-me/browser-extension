import chroma from 'chroma-js';

import { backgroundColors } from '~/design-system/styles/designTokens';

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Return ETH color if the color provided is too dark for dark mode
 * or too light for light mode
 * @param color - hex or rgb color
 * @returns
 */
export const handleAccentColor = (theme: 'dark' | 'light', color: string) => {
  const contrast = chroma.contrast(
    color,
    backgroundColors.surfacePrimary[theme].color,
  );
  if (contrast < 3) return chroma(color).luminance(0.3).hex();
  return color;
};

export const isDarkColor = (hex: string) => {
  const rgb = hexToRgb(hex);
  return !(Number(rgb?.r) > 40 || Number(rgb?.g) > 40 || Number(rgb?.b) > 40);
};
