import { useCallback, useEffect, useRef } from 'react';

import { ETH_ADDRESS } from '~/core/references';
import {
  selectUserAssetsDictByChain,
  selectorFilterByUserChains,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import {
  USER_ASSETS_STALE_INTERVAL,
  userAssetsSetQueryData,
  userAssetsSetQueryDefaults,
} from '~/core/resources/assets/userAssets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useSwapAssetsToRefreshStore } from '~/core/state/swapAssetsToRefresh';
import { fetchAssetBalanceViaProvider } from '~/core/utils/assets';
import { getProvider } from '~/core/wagmi/clientToProvider';

export const useSwapRefreshAssets = () => {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { swapAssetsToRefresh, removeSwapAssetsToRefresh } =
    useSwapAssetsToRefreshStore();
  const { data: userAssets } = useUserAssets(
    {
      address: currentAddress,
      currency: currentCurrency,
    },
    {
      select: (data) =>
        selectorFilterByUserChains({
          data,
          selector: selectUserAssetsDictByChain,
        }),
    },
  );

  const timeout = useRef<NodeJS.Timeout>();

  const swapRefreshAssets = useCallback(
    async (nonce?: number) => {
      const assetsToRefresh = swapAssetsToRefresh[nonce || -1];
      if (
        !assetsToRefresh ||
        !assetsToRefresh?.length ||
        !userAssets ||
        nonce === undefined
      )
        return;
      const [assetToBuy, assetToSell] = assetsToRefresh;

      const updatedAssets = userAssets;

      const fetchAssetPromises = [assetToBuy, assetToSell]
        .map(
          (asset) =>
            asset.address !== ETH_ADDRESS &&
            fetchAssetBalanceViaProvider({
              parsedAsset: asset,
              currentAddress,
              currency: currentCurrency,
              provider: getProvider({ chainId: asset.chainId }),
            }),
        )
        .filter(Boolean);

      const assets = await Promise.all(fetchAssetPromises);

      assets.forEach((asset) => {
        if (!asset) return;
        updatedAssets[asset.chainId][asset.uniqueId] = asset;
      });

      userAssetsSetQueryData({
        address: currentAddress,
        currency: currentCurrency,
        userAssets: updatedAssets,
      });
      userAssetsSetQueryDefaults({
        address: currentAddress,
        currency: currentCurrency,
        staleTime: USER_ASSETS_STALE_INTERVAL,
      });

      timeout.current = setTimeout(() => {
        userAssetsSetQueryDefaults({
          address: currentAddress,
          currency: currentCurrency,
          staleTime: 0,
        });
      }, USER_ASSETS_STALE_INTERVAL);

      removeSwapAssetsToRefresh({ nonce });
    },
    [
      currentAddress,
      currentCurrency,
      removeSwapAssetsToRefresh,
      swapAssetsToRefresh,
      userAssets,
    ],
  );

  useEffect(() => {
    return () => clearTimeout(timeout.current);
  });

  return { swapRefreshAssets };
};
