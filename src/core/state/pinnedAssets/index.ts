import create from 'zustand';

import { createStore } from '../internal/createStore';

type UpdatePinnedAssetArgs = {
  uniqueId: string;
};

type UpdatePinnedAssetFn = ({ uniqueId }: UpdatePinnedAssetArgs) => void;

export interface PinnedAssetState {
  uniqueIds: string[];
  addPinnedAsset: UpdatePinnedAssetFn;
  removedPinnedAsset: UpdatePinnedAssetFn;
}

export const pinnedAssets = createStore<PinnedAssetState>(
  (set, get) => ({
    uniqueIds: [],
    addPinnedAsset: ({ uniqueId }: UpdatePinnedAssetArgs) => {
      const { uniqueIds } = get();
      set({ uniqueIds: [...uniqueIds, uniqueId] });
    },
    removedPinnedAsset: ({ uniqueId }: UpdatePinnedAssetArgs) => {
      const { uniqueIds } = get();
      set({
        uniqueIds: uniqueIds.filter((id) => id !== uniqueId),
      });
    },
  }),
  {
    persist: {
      name: 'pinned_assets',
      version: 1,
    },
  },
);

export const usePinnedAssetStore = create(pinnedAssets);
