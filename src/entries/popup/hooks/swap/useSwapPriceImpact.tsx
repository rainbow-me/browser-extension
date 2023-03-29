import { CrosschainQuote, Quote, SwapType } from '@rainbow-me/swaps';
import { useMemo } from 'react';

import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import {
  convertAmountToNativeDisplay,
  convertRawAmountToNativeDisplay,
  divide,
  greaterThanOrEqualTo,
  subtract,
} from '~/core/utils/numbers';

import { useNativeAssetForNetwork } from '../useNativeAssetForNetwork';

const highPriceImpactThreshold = 0.05;
const severePriceImpactThreshold = 0.1;

export enum SwapPriceImpactType {
  none = 'none',
  high = 'high',
  severe = 'severe',
}

export interface SwapPriceImpact {
  type: SwapPriceImpactType;
  impactDisplay: string;
}

export const useSwapPriceImpact = ({
  assetToSell,
  assetToBuy,
  quote,
}: {
  assetToSell?: ParsedSearchAsset | null;
  assetToBuy?: ParsedSearchAsset | null;
  quote?: Quote | CrosschainQuote;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  const nativeAsset = useNativeAssetForNetwork({
    chainId: assetToSell?.chainId || ChainId.mainnet,
  });

  const isNormalQuote = useMemo(
    () => quote?.swapType === SwapType.normal,
    [quote?.swapType],
  );

  const sellNativeAmount = useMemo(() => {
    if (isNormalQuote)
      return convertRawAmountToNativeDisplay(
        quote?.sellAmountInEth.toString() || '',
        nativeAsset?.decimals || 18,
        nativeAsset?.price?.value || '0',
        currentCurrency,
      ).amount;
    else
      return convertRawAmountToNativeDisplay(
        quote?.sellAmount?.toString() || '',
        assetToSell?.decimals || 18,
        assetToSell?.price?.value || '0',
        currentCurrency,
      ).amount;
  }, [
    assetToSell?.decimals,
    assetToSell?.price?.value,
    currentCurrency,
    isNormalQuote,
    nativeAsset?.decimals,
    nativeAsset?.price?.value,
    quote?.sellAmount,
    quote?.sellAmountInEth,
  ]);

  const buyNativeAmount = useMemo(() => {
    if (isNormalQuote)
      return convertRawAmountToNativeDisplay(
        quote?.buyAmountInEth.toString() || '',
        nativeAsset?.decimals || 18,
        nativeAsset?.price?.value || '0',
        currentCurrency,
      ).amount;
    else
      return convertRawAmountToNativeDisplay(
        quote?.buyAmount?.toString() || '',
        assetToBuy?.decimals || 18,
        assetToBuy?.price?.value || '0',
        currentCurrency,
      ).amount;
  }, [
    assetToBuy?.decimals,
    assetToBuy?.price?.value,
    currentCurrency,
    isNormalQuote,
    nativeAsset?.decimals,
    nativeAsset?.price?.value,
    quote?.buyAmount,
    quote?.buyAmountInEth,
  ]);

  const { impactDisplay, priceImpact } = useMemo(() => {
    const nativeAmountImpact = subtract(sellNativeAmount, buyNativeAmount);
    const priceImpact = divide(nativeAmountImpact, sellNativeAmount);

    const impactDisplay = convertAmountToNativeDisplay(
      nativeAmountImpact,
      currentCurrency,
    );
    return { impactDisplay, priceImpact };
  }, [buyNativeAmount, currentCurrency, sellNativeAmount]);

  if (greaterThanOrEqualTo(priceImpact, severePriceImpactThreshold)) {
    return {
      priceImpact: {
        type: SwapPriceImpactType.severe,
        impactDisplay,
      },
    };
  } else if (greaterThanOrEqualTo(priceImpact, highPriceImpactThreshold)) {
    return {
      priceImpact: {
        type: SwapPriceImpactType.high,
        impactDisplay,
      },
    };
  } else {
    return {
      priceImpact: {
        type: SwapPriceImpactType.none,
        impactDisplay,
      },
    };
  }
};
