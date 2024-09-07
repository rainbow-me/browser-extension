import { CrosschainQuote, Quote } from '@rainbow-me/swaps';
import { useMemo } from 'react';

import { supportedCurrencies } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import {
  convertAmountAndPriceToNativeDisplay,
  convertRawAmountToNativeDisplay,
  handleSignificantDecimalsAsNumber,
} from '~/core/utils/numbers';

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

  const assetToSellNativeDisplay = useMemo(() => {
    let nativeDisplay = null;
    if (isWrapOrUnwrapEth) {
      nativeDisplay =
        !quote?.sellAmount || !assetToSell?.price?.value
          ? null
          : convertRawAmountToNativeDisplay(
              quote?.sellAmount?.toString(),
              quote?.sellTokenAsset?.decimals || 18,
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
        !quote?.sellAmountInEth || !quote?.sellTokenAsset?.price?.value
          ? null
          : convertRawAmountToNativeDisplay(
              quote?.sellAmountInEth?.toString(),
              quote?.sellTokenAsset?.decimals || 18,
              quote?.sellTokenAsset?.price?.value,
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
    assetToSellValue,
    currentCurrency,
    quote?.sellAmount,
    quote?.sellTokenAsset?.decimals,
    quote?.sellTokenAsset?.price?.value,
    quote?.sellAmountInEth,
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
        !quote?.buyAmountInEth || !quote?.buyTokenAsset?.price?.value
          ? null
          : convertRawAmountToNativeDisplay(
              quote?.buyAmountInEth?.toString(),
              quote?.buyTokenAsset?.decimals || 18,
              quote?.buyTokenAsset?.price?.value,
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
    quote?.buyTokenAsset?.price?.value,
    quote?.buyTokenAsset?.decimals,
  ]);

  return {
    assetToSellNativeDisplay,
    assetToBuyNativeDisplay,
  };
};
