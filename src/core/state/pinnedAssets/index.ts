import { Address } from 'viem';

import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

type PinnedAsset = {
  pinned: boolean;
  createdAt: number;
};

type PinnedAssetDict = Record<string, PinnedAsset>;
type PinnedAssetsByAddress = Record<Address, PinnedAssetDict>;

export interface PinnedAssetState {
  pinned: PinnedAssetsByAddress;
  togglePinAsset: (address: Address, uniqueId: string) => void;
}

export const usePinnedAssetStore = createRainbowStore<PinnedAssetState>(
  (set, get) => ({
    pinned: {},
    togglePinAsset: (address: Address, uniqueId: string) => {
      const { pinned } = get();
      const isPinned = pinned[address]?.[uniqueId]?.pinned;
      set({
        pinned: {
          ...pinned,
          [address]: {
            ...(pinned[address] ?? {}),
            [uniqueId]: {
              pinned: !isPinned,
              createdAt: isPinned
                ? pinned[address][uniqueId].createdAt
                : Date.now(),
            },
          },
        },
      });
    },
  }),
  {
    storageKey: 'pinned_assets',
    version: 2,
  },
);
