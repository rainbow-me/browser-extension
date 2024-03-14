import create from 'zustand';

import { createStore } from '../internal/createStore';

type UpdateHiddenAssetArgs = {
  uniqueId: string;
};

type UpdateHiddenAssetFn = ({ uniqueId }: UpdateHiddenAssetArgs) => void;

export interface HiddenAssetState {
  hiddenAssets: string[];
  addHiddenAsset: UpdateHiddenAssetFn;
  removeHiddenAsset: UpdateHiddenAssetFn;
}

export const hiddenAssets = createStore<HiddenAssetState>(
  (set, get) => ({
    hiddenAssets: [],
    addHiddenAsset: ({ uniqueId }: UpdateHiddenAssetArgs) => {
      const { hiddenAssets } = get();
      set({
        hiddenAssets: [...hiddenAssets, uniqueId],
      });
    },
    removeHiddenAsset: ({ uniqueId }: UpdateHiddenAssetArgs) => {
      const { hiddenAssets } = get();
      set({
        hiddenAssets: hiddenAssets.filter(
          (_uniqueId) => _uniqueId !== uniqueId,
        ),
      });
    },
  }),
  {
    persist: {
      name: 'hidden_assets',
      version: 1,
    },
  },
);

export const useHiddenAssetStore = create(hiddenAssets);
