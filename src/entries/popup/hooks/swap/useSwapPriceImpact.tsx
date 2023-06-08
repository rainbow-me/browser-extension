import { CrosschainQuote, Quote } from '@rainbow-me/swaps';
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
      return convertRawAmountToNativeDisplay(
        quote?.sellAmount?.toString() || '',
        assetToSell?.decimals || 18,
        assetToSell?.price?.value || '0',
        currentCurrency,
      ).amount;
    } else {
      return convertRawAmountToNativeDisplay(
        quote?.sellAmountInEth.toString() || '',
        sellNativeAsset?.decimals || 18,
        sellNativeAsset?.price?.value || '0',
        currentCurrency,
      ).amount;
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
      return convertRawAmountToNativeDisplay(
        quote?.buyAmount?.toString() || '',
        assetToBuy?.decimals || 18,
        assetToBuy?.price?.value || '0',
        currentCurrency,
      ).amount;
    } else {
      return convertRawAmountToNativeDisplay(
        quote?.buyAmountInEth.toString() || '',
        buyNativeAsset?.decimals || 18,
        buyNativeAsset?.price?.value || '0',
        currentCurrency,
      ).amount;
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
