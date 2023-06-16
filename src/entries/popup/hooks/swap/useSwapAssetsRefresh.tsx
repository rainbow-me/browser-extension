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
      if (!assetsToRefresh || !userAssets) return;
      const [assetToBuy, assetToSell] = assetsToRefresh;
      const assetToBuyProvider = getProvider({ chainId: assetToBuy?.chainId });
      const assetToSellProvider = getProvider({
        chainId: assetToSell?.chainId,
      });

      const updatedAssetToBuy = await fetchAssetBalanceViaProvider({
        parsedAsset: assetToBuy,
        currentAddress,
        currency: currentCurrency,
        provider: assetToBuyProvider,
      });
      const updatedAssetToSell = await fetchAssetBalanceViaProvider({
        parsedAsset: assetToSell,
        currentAddress,
        currency: currentCurrency,
        provider: assetToSellProvider,
      });

      const assetToBuyChainIdAssets = userAssets[assetToBuy.chainId];
      const oldAssetToBuy = Object.values(assetToBuyChainIdAssets).find(
        (userAsset) =>
          userAsset.address === assetToBuy.address &&
          userAsset.uniqueId === assetToBuy.uniqueId &&
          userAsset.chainId === assetToBuy.chainId,
      );

      if (oldAssetToBuy) {
        assetToBuyChainIdAssets[oldAssetToBuy.uniqueId] = updatedAssetToBuy;
      }

      const assetToSellChainIdAssets = userAssets[assetToBuy.chainId];
      const oldAssetToSell = Object.values(assetToSellChainIdAssets).find(
        (userAsset) =>
          userAsset.address === assetToBuy.address &&
          userAsset.chainId === assetToBuy.chainId,
      );
      if (oldAssetToSell) {
        assetToSellChainIdAssets[oldAssetToSell.uniqueId] = updatedAssetToSell;
      }

      userAssetsSetQueryData({
        address: currentAddress,
        currency: currentCurrency,
        connectedToHardhat,
        userAssets,
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
