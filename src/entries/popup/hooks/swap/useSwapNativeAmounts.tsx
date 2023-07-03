import { CrosschainQuote, Quote } from '@rainbow-me/swaps';
import { useMemo } from 'react';

import { supportedCurrencies } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import {
  convertAmountAndPriceToNativeDisplay,
  convertRawAmountToNativeDisplay,
  handleSignificantDecimalsAsNumber,
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
    let nativeDisplay = null;
    if (isWrapOrUnwrapEth) {
      nativeDisplay =
        !quote?.sellAmount || !assetToSell?.price?.value
          ? null
          : convertRawAmountToNativeDisplay(
              quote?.sellAmount?.toString(),
              assetToSell?.decimals || 18,
              assetToSell?.price?.value,
              currentCurrency,
            );
    } else if (assetToSell?.native?.price?.amount && assetToSellValue) {
      nativeDisplay = convertAmountAndPriceToNativeDisplay(
        assetToSellValue,
        assetToSell?.native?.price?.amount,
        currentCurrency,
      );
    } else {
      nativeDisplay =
        !quote?.sellAmountInEth || !sellNativeAsset?.price?.value
          ? null
          : convertRawAmountToNativeDisplay(
              quote?.sellAmountInEth.toString(),
              sellNativeAsset?.decimals || 18,
              sellNativeAsset?.price?.value,
              currentCurrency,
            );
    }

    return nativeDisplay
      ? {
          amount: handleSignificantDecimalsAsNumber(
            nativeDisplay?.amount,
            supportedCurrencies[currentCurrency].decimals,
          ),
          display: nativeDisplay?.display,
        }
      : nativeDisplay;
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
    let nativeDisplay = null;
    if (isWrapOrUnwrapEth) {
      nativeDisplay =
        !quote?.buyAmount || !assetToBuy?.price?.value
          ? null
          : convertRawAmountToNativeDisplay(
              quote?.buyAmount?.toString(),
              assetToBuy?.decimals || 18,
              assetToBuy?.price?.value,
              currentCurrency,
            );
    } else if (assetToBuy?.native?.price?.amount && assetToBuyValue) {
      nativeDisplay = convertAmountAndPriceToNativeDisplay(
        assetToBuyValue,
        assetToBuy?.native?.price?.amount,
        currentCurrency,
      );
    } else {
      nativeDisplay =
        !quote?.buyAmountInEth || !buyNativeAsset?.price?.value
          ? null
          : convertRawAmountToNativeDisplay(
              quote?.buyAmountInEth.toString(),
              buyNativeAsset?.decimals || 18,
              buyNativeAsset?.price?.value,
              currentCurrency,
            );
    }
    return nativeDisplay
      ? {
          amount: handleSignificantDecimalsAsNumber(
            nativeDisplay?.amount,
            supportedCurrencies[currentCurrency].decimals,
          ),
          display: nativeDisplay?.display,
        }
      : nativeDisplay;
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
