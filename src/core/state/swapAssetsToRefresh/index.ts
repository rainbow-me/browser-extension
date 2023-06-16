import create from 'zustand';

import { ParsedSearchAsset } from '~/core/types/assets';

import { createStore } from '../internal/createStore';

export interface SwapAssetsToRefreshState {
  setSwapAssetsToRefresh: (assetsToRefresh: {
    hash: string;
    assetToSell: ParsedSearchAsset;
    assetToBuy: ParsedSearchAsset;
  }) => void;
  swapAssetsToRefresh: { [txHash: string]: ParsedSearchAsset[] };
}

export const swapAssetsToRefreshStore = createStore<SwapAssetsToRefreshState>(
  (set, get) => ({
    setSwapAssetsToRefresh: ({ hash, assetToBuy, assetToSell }) => {
      const swapAssetsToRefresh = get().swapAssetsToRefresh;
      swapAssetsToRefresh[hash] = [assetToSell, assetToBuy];
      set(swapAssetsToRefresh);
    },
    swapAssetsToRefresh: {},
  }),
);

export const useSwapAssetsToRefreshStore = create(swapAssetsToRefreshStore);
