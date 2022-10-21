import chroma from 'chroma-js';

export function hslObjectForColor(color: string) {
  const [hue, saturation, lightness] = chroma(color).hsl();

  return {
    hue: String(hue),
    saturation: `${saturation * 100}%`,
    lightness: `${lightness * 100}%`,
  };
}
