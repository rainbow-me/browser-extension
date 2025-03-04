import { create } from 'zustand';

import { ParsedSearchAsset } from '~/core/types/assets';

import { createStore } from '../internal/createStore';
import { withSelectors } from '../internal/withSelectors';

export interface SwapAssetsToRefreshState {
  setSwapAssetsToRefresh: (assetsToRefresh: {
    nonce: number;
    assetToSell: ParsedSearchAsset;
    assetToBuy: ParsedSearchAsset;
  }) => void;
  removeSwapAssetsToRefresh: (assetsToRefresh: { nonce: number }) => void;
  swapAssetsToRefresh: { [nonce: number]: ParsedSearchAsset[] };
}

export const swapAssetsToRefreshStore = createStore<SwapAssetsToRefreshState>(
  (set, get) => ({
    setSwapAssetsToRefresh: ({ nonce, assetToBuy, assetToSell }) => {
      const swapAssetsToRefresh = get().swapAssetsToRefresh;
      swapAssetsToRefresh[nonce] = [assetToSell, assetToBuy];
      set(swapAssetsToRefresh);
    },
    removeSwapAssetsToRefresh: ({ nonce }) => {
      const swapAssetsToRefresh = get().swapAssetsToRefresh;
      delete swapAssetsToRefresh[nonce];
      set(swapAssetsToRefresh);
    },
    swapAssetsToRefresh: {},
  }),
);

export const useSwapAssetsToRefreshStore = withSelectors(
  create(swapAssetsToRefreshStore),
);
