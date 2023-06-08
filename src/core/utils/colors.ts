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
 * @param hex - hex color
 * @returns
 */
export const handleAssetAccentColor = (
  theme: 'dark' | 'light',
  hex?: string,
) => {
  if (!hex) return undefined;
  const rgb = hexToRgb(hex);
  if (theme === 'dark' && rgb && rgb?.g < 50) {
    // return ETH color
    return '#808088';
  }
  return hex;
};

export const isDarkColor = (hex: string) => {
  const rgb = hexToRgb(hex);
  return !(Number(rgb?.r) > 40 || Number(rgb?.g) > 40 || Number(rgb?.b) > 40);
};
