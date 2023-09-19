import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

type ColorCacheStore = {
  colorCache: Record<string, string | null>;
  setColorCache: (imageUrl: string, color: string | null) => void;
};

export const colorCacheStore = createStore<ColorCacheStore>(
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
