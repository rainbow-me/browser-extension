import { createBaseStore } from '@storesjs/stores';

import { createExtensionStoreOptions } from '../_internal';

type ColorCacheStore = {
  colorCache: Record<string, string | null>;
  setColorCache: (imageUrl: string, color: string | null) => void;
};

export const useColorCacheStore = createBaseStore<ColorCacheStore>(
  (set) => ({
    colorCache: {},
    setColorCache: (imageUrl, color) =>
      set((state) => ({
        colorCache: { ...state.colorCache, [imageUrl]: color },
      })),
  }),
  createExtensionStoreOptions({
    storageKey: 'dominantColorStore',
    version: 0,
  }),
);
