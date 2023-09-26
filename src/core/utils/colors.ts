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

const getRgb = (color: string) => {
  const [r, g, b] = color
    .substring(color.indexOf('(') + 1, color.length - 1)
    .split(',');
  return { r: +r, g: +g, b: +b };
};

/**
 * Return ETH color if the color provided is too dark for dark mode
 * or too light for light mode
 * @param color - hex or rgb color
 * @returns
 */
export const handleAccentColor = (theme: 'dark' | 'light', color: string) => {
  const rgb = color.startsWith('#') ? hexToRgb(color) : getRgb(color);
  if (theme === 'dark' && rgb && rgb?.g < 50) {
    // return ETH color
    return '#808088';
  }
  return color;
};

export const isDarkColor = (hex: string) => {
  const rgb = hexToRgb(hex);
  return !(Number(rgb?.r) > 40 || Number(rgb?.g) > 40 || Number(rgb?.b) > 40);
};
