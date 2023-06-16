import { getProvider } from '@wagmi/core';
import { useCallback } from 'react';

import { selectUserAssetsDictByChain } from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { userAssetsSetQueryData } from '~/core/resources/assets/userAssets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { useSwapAssetsToRefreshStore } from '~/core/state/swapAssetsToRefresh';
import { fetchAssetBalanceViaProvider } from '~/core/utils/assets';

export const useSwapRefreshAssets = () => {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { swapAssetsToRefresh, removeSwapAssetsToRefresh } =
    useSwapAssetsToRefreshStore();
  const { connectedToHardhat } = useConnectedToHardhatStore();
  const { data: userAssets } = useUserAssets(
    {
      address: currentAddress,
      currency: currentCurrency,
      connectedToHardhat,
    },
    { select: selectUserAssetsDictByChain },
  );

  const refreshAssets = useCallback(
    async (hash: string) => {
      const assetsToRefresh = swapAssetsToRefresh[hash];
      if (!assetsToRefresh.length || !userAssets) return;
      const [assetToBuy, assetToSell] = assetsToRefresh;

      const updatedAssets = userAssets;
      const assetToBuyProvider = getProvider({ chainId: assetToBuy?.chainId });
      const assetToSellProvider = getProvider({
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
        connectedToHardhat,
        userAssets: updatedAssets,
      });

      removeSwapAssetsToRefresh({ hash });
    },
    [
      connectedToHardhat,
      currentAddress,
      currentCurrency,
      removeSwapAssetsToRefresh,
      swapAssetsToRefresh,
      userAssets,
    ],
  );

  return { refreshAssets };
};
