import { useQuery } from '@tanstack/react-query';
import makeColorMoreChill from 'make-color-more-chill';
import Vibrant from 'node-vibrant';
import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

type ColorCacheStore = {
  colorCache: Record<string, string | null>;
  setColorCache: (imageUrl: string, color: string | null) => void;
};

const colorCacheStore = createStore<ColorCacheStore>(
  (set) => ({
    colorCache: {},
    setColorCache: (imageUrl, color) =>
      set((state) => ({
        colorCache: { ...state.colorCache, [imageUrl]: color },
      })),
  }),
  {
    persist: {
      name: 'dominantColorStore',
      version: 0,
    },
  },
);

export const useColorCacheStore = create(colorCacheStore);

export function useDominantColor({ imageUrl }: { imageUrl?: string }) {
  const { colorCache, setColorCache } = useColorCacheStore();

  return useQuery(
    ['color', imageUrl],
    async () => {
      if (!imageUrl) return null;

      if (colorCache[imageUrl]) {
        return colorCache[imageUrl];
      }

      const color = (await Vibrant.from(imageUrl).getPalette()).Vibrant?.hex;
      const chillColor = color ? makeColorMoreChill(color) : null;
      setColorCache(imageUrl, chillColor);

      return chillColor;
    },
    { enabled: !!imageUrl },
  );
}
