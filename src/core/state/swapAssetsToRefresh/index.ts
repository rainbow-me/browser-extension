import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
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
  createRainbowStore<SwapAssetsToRefreshState>((set, get) => ({
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
  }));
