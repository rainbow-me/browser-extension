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
  sellNativeAmount,
  buyNativeAmount,
}: {
  sellNativeAmount: { amount: string; display: string } | null;
  buyNativeAmount: { amount: string; display: string } | null;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();

  const { impactDisplay, priceImpact } = useMemo(() => {
    if (!sellNativeAmount?.amount || !buyNativeAmount?.amount)
      return { impactDisplay: '', priceImpact: 0 };

    const nativeAmountImpact = subtract(
      sellNativeAmount.amount,
      buyNativeAmount.amount,
    );
    const priceImpact = divide(nativeAmountImpact, sellNativeAmount.amount);

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
