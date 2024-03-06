import create from 'zustand';

import { createStore } from '../internal/createStore';

type PinnedAsset = {
  uniqueId: string;
  createdAt: number;
};

type UpdatePinnedAssetArgs = {
  uniqueId: string;
};

type UpdatePinnedAssetFn = ({ uniqueId }: UpdatePinnedAssetArgs) => void;

export interface PinnedAssetState {
  pinnedAssets: PinnedAsset[];
  addPinnedAsset: UpdatePinnedAssetFn;
  removedPinnedAsset: UpdatePinnedAssetFn;
}

export const pinnedAssets = createStore<PinnedAssetState>(
  (set, get) => ({
    pinnedAssets: [],
    addPinnedAsset: ({ uniqueId }: UpdatePinnedAssetArgs) => {
      const { pinnedAssets } = get();
      set({
        pinnedAssets: [
          ...pinnedAssets,
          { uniqueId, createdAt: new Date().getTime() },
        ],
      });
    },
    removedPinnedAsset: ({ uniqueId }: UpdatePinnedAssetArgs) => {
      const { pinnedAssets } = get();
      set({
        pinnedAssets: pinnedAssets.filter(
          ({ uniqueId: _uniqueId }) => _uniqueId !== uniqueId,
        ),
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
