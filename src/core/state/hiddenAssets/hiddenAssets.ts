import { Address } from 'viem';

import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { ParsedUserAsset } from '~/core/types/assets';
import { SearchAsset } from '~/core/types/search';

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

export const useHiddenAssetStore = createRainbowStore<HiddenAssetState>(
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
    storageKey: 'hidden_assets',
    version: 2,
  },
);
