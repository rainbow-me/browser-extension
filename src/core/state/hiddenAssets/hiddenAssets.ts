import { Address } from 'viem';
import { create } from 'zustand';

import { ParsedUserAsset } from '~/core/types/assets';
import { SearchAsset } from '~/core/types/search';

import { createStore } from '../internal/createStore';
import { withSelectors } from '../internal/withSelectors';

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

export const hiddenAssetsStore = createStore<HiddenAssetState>(
  (set, get) => ({
    hidden: {},
    toggleHideAsset: (address: Address, uniqueId: string) => {
      const { hidden } = get();
      set({
        hidden: {
          ...hidden,
          [address]: {
            ...(hidden[address] ?? {}),
            [uniqueId]: !hidden[address]?.[uniqueId],
          },
        },
      });
    },
  }),
  {
    persist: {
      name: 'hidden_assets',
      version: 2,
    },
  },
);

export const useHiddenAssetStore = withSelectors(
  create(() => hiddenAssetsStore.getState()),
);
