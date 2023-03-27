import { CrosschainQuote, Quote } from '@rainbow-me/swaps';
import { useMemo } from 'react';

import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import {
  convertRawAmountToNativeDisplay,
  divide,
  greaterThanOrEqualTo,
  subtract,
} from '~/core/utils/numbers';

const highPriceImpactThreshold = 0.05;
const severePriceImpactThreshold = 0.1;

export enum SWAP_PRICE_IMPACT {
  none = 'none',
  high = 'high',
  severe = 'severe',
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

  //   const isNormalQuote = useMemo(
  //     () => quote?.swapType === SwapType.normal,
  //     [quote?.swapType],
  //   );

  const sellAmount = useMemo(() => {
    // if (isNormalQuote) return quote?.sellAmountInEth;
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
    // isNormalQuote,
    quote?.sellAmount,
    // quote?.sellAmountInEth,
  ]);

  const buyAmount = useMemo(() => {
    // if (isNormalQuote) return quote?.buyAmountInEth;
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
    // isNormalQuote,
    quote?.buyAmount,
    // quote?.buyAmountInEth,
  ]);

  const priceImpact = divide(subtract(sellAmount, buyAmount), sellAmount);

  if (greaterThanOrEqualTo(priceImpact, highPriceImpactThreshold)) {
    return {
      priceImpact: SWAP_PRICE_IMPACT.high,
    };
  } else if (greaterThanOrEqualTo(priceImpact, severePriceImpactThreshold)) {
    return {
      priceImpact: SWAP_PRICE_IMPACT.severe,
    };
  } else {
    return { priceImpact: SWAP_PRICE_IMPACT.none };
  }
};
