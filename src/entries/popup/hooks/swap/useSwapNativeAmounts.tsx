import { CrosschainQuote, Quote } from '@rainbow-me/swaps';
import { useMemo } from 'react';

import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { convertRawAmountToNativeDisplay } from '~/core/utils/numbers';

import { useNativeAssetForNetwork } from '../useNativeAssetForNetwork';

export const useSwapNativeAmounts = ({
  assetToSell,
  assetToBuy,
  quote,
  isWrapOrUnwrapEth,
}: {
  assetToSell?: ParsedSearchAsset | null;
  assetToBuy?: ParsedSearchAsset | null;
  quote?: Quote | CrosschainQuote;
  isWrapOrUnwrapEth: boolean;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  const sellNativeAsset = useNativeAssetForNetwork({
    chainId: assetToSell?.chainId || ChainId.mainnet,
  });

  const buyNativeAsset = useNativeAssetForNetwork({
    chainId: assetToBuy?.chainId || ChainId.mainnet,
  });

  const sellNativeAmount = useMemo(() => {
    if (isWrapOrUnwrapEth) {
      return !quote?.sellAmount || !assetToSell?.price?.value
        ? null
        : convertRawAmountToNativeDisplay(
            quote?.sellAmount?.toString(),
            assetToSell?.decimals || 18,
            assetToSell?.price?.value,
            currentCurrency,
          );
    } else {
      return !quote?.sellAmountInEth || !sellNativeAsset?.price?.value
        ? null
        : convertRawAmountToNativeDisplay(
            quote?.sellAmountInEth.toString(),
            sellNativeAsset?.decimals || 18,
            sellNativeAsset?.price?.value,
            currentCurrency,
          );
    }
  }, [
    isWrapOrUnwrapEth,
    quote?.sellAmountInEth,
    quote?.sellAmount,
    sellNativeAsset?.decimals,
    sellNativeAsset?.price?.value,
    currentCurrency,
    assetToSell?.decimals,
    assetToSell?.price?.value,
  ]);

  const buyNativeAmount = useMemo(() => {
    if (isWrapOrUnwrapEth) {
      return !quote?.buyAmount || !assetToBuy?.price?.value
        ? null
        : convertRawAmountToNativeDisplay(
            quote?.buyAmount?.toString(),
            assetToBuy?.decimals || 18,
            assetToBuy?.price?.value,
            currentCurrency,
          );
    } else {
      return !quote?.buyAmountInEth || !buyNativeAsset?.price?.value
        ? null
        : convertRawAmountToNativeDisplay(
            quote?.buyAmountInEth.toString(),
            buyNativeAsset?.decimals || 18,
            buyNativeAsset?.price?.value,
            currentCurrency,
          );
    }
  }, [
    isWrapOrUnwrapEth,
    quote?.buyAmountInEth,
    quote?.buyAmount,
    buyNativeAsset?.decimals,
    buyNativeAsset?.price?.value,
    currentCurrency,
    assetToBuy?.decimals,
    assetToBuy?.price?.value,
  ]);

  return {
    sellNativeAmount,
    buyNativeAmount,
  };
};
