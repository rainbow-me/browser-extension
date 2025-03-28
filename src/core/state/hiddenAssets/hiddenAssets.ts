import { Address } from 'viem';
import create from 'zustand';

import { analytics } from '~/analytics';
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
      const wasHidden = hidden[address]?.[uniqueId] || false;
      set({
        hidden: {
          ...hidden,
          [address]: {
            ...(hidden[address] ?? {}),
            [uniqueId]: !wasHidden,
          },
        },
      });
      const updatedState = get();
      const isNowHidden = updatedState.hidden[address]?.[uniqueId] || false;
      const totalHiddenForAddress = Object.values(
        updatedState.hidden[address] || {},
      ).filter((isHidden) => isHidden).length;

      const [assetAddress, chainIdStr] = uniqueId.split('-');

      const assetHiddenAnalytics = {
        token: {
          address: assetAddress,
          chainId: parseInt(chainIdStr),
          walletAddress: address,
        },
        hiddenAssets: {
          totalHidden: totalHiddenForAddress,
        },
      };

      const event = isNowHidden
        ? analytics.event.assetHidden
        : analytics.event.assetUnhidden;
      analytics.track(event, assetHiddenAnalytics);
    },
  }),
  {
    persist: {
      name: 'hidden_assets',
      version: 2,
    },
  },
);

export const useHiddenAssetStore = withSelectors(create(hiddenAssetsStore));
