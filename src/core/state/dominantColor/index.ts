import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

type ColorCacheStore = {
  colorCache: Record<string, string | null>;
  setColorCache: (imageUrl: string, color: string | null) => void;
};

export const useColorCacheStore = createRainbowStore<ColorCacheStore>(
  (set) => ({
    colorCache: {},
    setColorCache: (imageUrl, color) =>
      set((state) => ({
        colorCache: { ...state.colorCache, [imageUrl]: color },
      })),
  }),
  {
    storageKey: 'dominantColorStore',
    version: 0,
  },
);
