import { CrosschainQuote, Quote } from '@rainbow-me/swaps';
import { useMemo } from 'react';

import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import {
  convertAmountAndPriceToNativeDisplay,
  convertRawAmountToNativeDisplay,
} from '~/core/utils/numbers';

import { useNativeAssetForNetwork } from '../useNativeAssetForNetwork';

export const useSwapNativeAmounts = ({
  assetToSell,
  assetToSellValue,
  assetToBuy,
  assetToBuyValue,
  quote,
  isWrapOrUnwrapEth,
}: {
  assetToSell?: ParsedSearchAsset | null;
  assetToBuy?: ParsedSearchAsset | null;
  assetToBuyValue?: string;
  assetToSellValue?: string;
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

  const assetToSellNativeDisplay = useMemo(() => {
    if (isWrapOrUnwrapEth) {
      return !quote?.sellAmount || !assetToSell?.price?.value
        ? null
        : convertRawAmountToNativeDisplay(
            quote?.sellAmount?.toString(),
            assetToSell?.decimals || 18,
            assetToSell?.price?.value,
            currentCurrency,
          );
    } else if (assetToSell?.native?.price?.amount && assetToSellValue) {
      return convertAmountAndPriceToNativeDisplay(
        assetToSellValue,
        assetToSell?.native?.price?.amount,
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
    assetToSell?.native?.price?.amount,
    assetToSell?.price?.value,
    assetToSell?.decimals,
    quote?.sellAmount,
    quote?.sellAmountInEth,
    currentCurrency,
    assetToSellValue,
    sellNativeAsset?.price?.value,
    sellNativeAsset?.decimals,
  ]);

  const assetToBuyNativeDisplay = useMemo(() => {
    if (isWrapOrUnwrapEth) {
      return !quote?.buyAmount || !assetToBuy?.price?.value
        ? null
        : convertRawAmountToNativeDisplay(
            quote?.buyAmount?.toString(),
            assetToBuy?.decimals || 18,
            assetToBuy?.price?.value,
            currentCurrency,
          );
    } else if (assetToBuy?.native?.price?.amount && assetToBuyValue) {
      return convertAmountAndPriceToNativeDisplay(
        assetToBuyValue,
        assetToBuy?.native?.price?.amount,
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
    assetToBuy?.native?.price?.amount,
    assetToBuy?.price?.value,
    assetToBuy?.decimals,
    assetToBuyValue,
    quote?.buyAmount,
    quote?.buyAmountInEth,
    currentCurrency,
    buyNativeAsset?.price?.value,
    buyNativeAsset?.decimals,
  ]);

  return {
    assetToSellNativeDisplay,
    assetToBuyNativeDisplay,
  };
};
