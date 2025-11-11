import { createBaseStore } from 'stores';

import { ParsedSearchAsset } from '~/core/types/assets';

export interface SwapAssetsToRefreshState {
  setSwapAssetsToRefresh: (assetsToRefresh: {
    nonce: number;
    assetToSell: ParsedSearchAsset;
    assetToBuy: ParsedSearchAsset;
  }) => void;
  removeSwapAssetsToRefresh: (assetsToRefresh: { nonce: number }) => void;
  swapAssetsToRefresh: { [nonce: number]: ParsedSearchAsset[] };
}

export const useSwapAssetsToRefreshStore =
  createBaseStore<SwapAssetsToRefreshState>((set) => ({
    setSwapAssetsToRefresh: ({ nonce, assetToBuy, assetToSell }) => {
      set((state) => ({
        swapAssetsToRefresh: {
          ...state.swapAssetsToRefresh,
          [nonce]: [assetToSell, assetToBuy],
        },
      }));
    },
    removeSwapAssetsToRefresh: ({ nonce }) => {
      set((state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [nonce]: _, ...rest } = state.swapAssetsToRefresh;
        return { swapAssetsToRefresh: rest };
      });
    },
    swapAssetsToRefresh: {},
  }));
