import { createBaseStore } from 'stores';
import { Address } from 'viem';

import { ParsedUserAsset } from '~/core/types/assets';
import { SearchAsset } from '~/core/types/search';

import { createExtensionStoreOptions } from '../_internal';

type HiddenAssetDict = Record<string, boolean>;
type HiddenAssetsByAddress = Record<Address, HiddenAssetDict>;

export interface HiddenAssetState {
  hidden: HiddenAssetsByAddress;
  toggleHideAsset: (address: Address, uniqueId: string) => void;
}

export const computeUniqueIdForHiddenAsset = (
  asset: ParsedUserAsset | SearchAsset,
) => {
  return `${asset.address}-${asset.chainId}`;
};

export const useHiddenAssetStore = createBaseStore<HiddenAssetState>(
  (set) => ({
    hidden: {},
    toggleHideAsset: (address: Address, uniqueId: string) => {
      set((state) => ({
        hidden: {
          ...state.hidden,
          [address]: {
            ...(state.hidden[address] ?? {}),
            [uniqueId]: !state.hidden[address]?.[uniqueId],
          },
        },
      }));
    },
  }),
  createExtensionStoreOptions({
    storageKey: 'hidden_assets',
    version: 2,
  }),
);
