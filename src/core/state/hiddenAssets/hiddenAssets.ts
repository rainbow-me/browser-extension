import { Address } from 'viem';
import create from 'zustand';

import { analytics } from '~/analytics'; // Add this import
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
      // Get the updated state after the change for analytics reporting
      const updatedState = get();
      const isNowHidden = updatedState.hidden[address]?.[uniqueId] || false;
      // Calculate total hidden assets for this address
      const totalHiddenForAddress = Object.values(
        updatedState.hidden[address] || {},
      ).filter((isHidden) => isHidden).length;

      const assetHiddenAnalytics = {
        token: {
          address: uniqueId.split('-')[0], // Extract the asset address from uniqueId
          chainId: parseInt(uniqueId.split('-')[1]), // Extract the chainId from uniqueId
          walletAddress: address,
        },
        hiddenAssets: {
          totalHidden: totalHiddenForAddress,
        },
      };
      // Track the appropriate event based on whether we hid or unhid
      if (isNowHidden) {
        analytics.track(analytics.event.assetHidden, assetHiddenAnalytics);
      } else {
        analytics.track(analytics.event.assetUnhidden, assetHiddenAnalytics);
      }
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
