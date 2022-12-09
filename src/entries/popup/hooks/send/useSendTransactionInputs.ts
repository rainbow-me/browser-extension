import { useCallback, useMemo, useState } from 'react';

import { useCurrentCurrencyStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import {
  convertAmountAndPriceToNativeDisplay,
  convertAmountFromNativeValue,
} from '~/core/utils/numbers';

import { useNativeAssetForNetwork } from '../useNativeAssetForNetwork';

export const useSendTransactionInputs = () => {
  const nativeAsset = useNativeAssetForNetwork({ chainId: ChainId.mainnet });

  const [independentAmount, setIndependentAmount] = useState<string>();
  const { currentCurrency } = useCurrentCurrencyStore();
  const [independentField, setIndependentField] = useState<'native' | 'asset'>(
    'asset',
  );

  const asset = nativeAsset;

  const dependentAmount = useMemo(() => {
    if (independentField === 'asset') {
      return convertAmountAndPriceToNativeDisplay(
        independentAmount as string,
        asset?.price?.value || 0,
        currentCurrency,
      ).amount;
    } else {
      return convertAmountFromNativeValue(
        independentAmount as string,
        asset?.price?.value || 0,
        asset?.decimals,
      );
    }
  }, [
    asset?.decimals,
    asset?.price?.value,
    currentCurrency,
    independentAmount,
    independentField,
  ]);

  const assetAmount = useMemo(
    () => (independentField === 'asset' ? independentAmount : dependentAmount),
    [dependentAmount, independentAmount, independentField],
  );

  const switchIndependentField = useCallback(() => {
    setIndependentField(independentField === 'asset' ? 'native' : 'asset');
  }, [independentField]);

  return {
    assetAmount,
    independentAmount,
    independentField,
    dependentAmount,
    setIndependentAmount,
    setIndependentField,
    switchIndependentField,
  };
};
