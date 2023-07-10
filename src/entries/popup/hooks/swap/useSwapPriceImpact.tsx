import { useMemo } from 'react';

import { useCurrentCurrencyStore } from '~/core/state';
import {
  convertAmountToNativeDisplay,
  divide,
  greaterThanOrEqualTo,
  subtract,
} from '~/core/utils/numbers';

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
  assetToSellNativeValue,
  assetToBuyNativeValue,
  isLoading,
}: {
  assetToSellNativeValue: { amount: string; display: string } | null;
  assetToBuyNativeValue: { amount: string; display: string } | null;
  isLoading: boolean;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();

  const { impactDisplay, priceImpact } = useMemo(() => {
    if (!assetToSellNativeValue?.amount || !assetToBuyNativeValue?.amount)
      return { impactDisplay: '', priceImpact: 0 };

    const nativeAmountImpact = subtract(
      assetToSellNativeValue.amount,
      assetToBuyNativeValue.amount,
    );
    const priceImpact = divide(
      nativeAmountImpact,
      assetToSellNativeValue.amount,
    );

    const impactDisplay = convertAmountToNativeDisplay(
      nativeAmountImpact,
      currentCurrency,
    );
    return { impactDisplay, priceImpact };
  }, [assetToBuyNativeValue, currentCurrency, assetToSellNativeValue]);

  if (
    !isLoading &&
    greaterThanOrEqualTo(priceImpact, severePriceImpactThreshold)
  ) {
    return {
      priceImpact: {
        type: SwapPriceImpactType.severe,
        impactDisplay,
      },
    };
  } else if (
    !isLoading &&
    greaterThanOrEqualTo(priceImpact, highPriceImpactThreshold)
  ) {
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
