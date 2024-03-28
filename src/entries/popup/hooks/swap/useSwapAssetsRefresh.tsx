import { getPublicClient } from 'wagmi/actions';
import { useCallback, useEffect, useRef } from 'react';

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
      const assetToBuyProvider = getPublicClient({ chainId: assetToBuy?.chainId });
      const assetToSellProvider = getPublicClient({
        chainId: assetToSell?.chainId,
      });

      const [updatedAssetToBuy, updatedAssetToSell] = await Promise.all([
        fetchAssetBalanceViaProvider({
          parsedAsset: assetToBuy,
          currentAddress,
          currency: currentCurrency,
          provider: assetToBuyProvider,
        }),
        fetchAssetBalanceViaProvider({
          parsedAsset: assetToSell,
          currentAddress,
          currency: currentCurrency,
          provider: assetToSellProvider,
        }),
      ]);

      updatedAssets[assetToBuy.chainId][updatedAssetToBuy.uniqueId] =
        updatedAssetToBuy;
      updatedAssets[assetToSell.chainId][updatedAssetToSell.uniqueId] =
        updatedAssetToSell;

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
