import { createBaseStore } from '@storesjs/stores';
import { Address } from 'viem';

import { createExtensionStoreOptions } from '../_internal';

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

export const usePinnedAssetStore = createBaseStore<PinnedAssetState>(
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
  createExtensionStoreOptions({
    storageKey: 'pinned_assets',
    version: 2,
  }),
);
