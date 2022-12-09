import { useCallback, useMemo, useRef, useState } from 'react';

import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedAddressAsset } from '~/core/types/assets';
import {
  convertAmountAndPriceToNativeDisplay,
  convertAmountFromNativeValue,
  convertAmountToBalanceDisplay,
} from '~/core/utils/numbers';

export const useSendTransactionInputs = ({
  asset,
}: {
  asset: ParsedAddressAsset;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  const independentFieldRef = useRef<HTMLInputElement>(null);
  const [independentAmount, setIndependentAmount] = useState<string>('');
  const [independentField, setIndependentField] = useState<'native' | 'asset'>(
    'asset',
  );

  const dependentAmount = useMemo(() => {
    if (independentField === 'asset') {
      return convertAmountAndPriceToNativeDisplay(
        (independentAmount as string) || '0',
        asset?.price?.value || 0,
        currentCurrency,
      );
    } else {
      const amountFromNativeValue = convertAmountFromNativeValue(
        (independentAmount as string) || '0',
        asset?.price?.value || 0,
        asset?.decimals,
      );
      return {
        display: convertAmountToBalanceDisplay(amountFromNativeValue, asset),
        amount: amountFromNativeValue,
      };
    }
  }, [asset, currentCurrency, independentAmount, independentField]);

  const assetAmount = useMemo(
    () =>
      independentField === 'asset' ? independentAmount : dependentAmount.amount,
    [dependentAmount, independentAmount, independentField],
  );

  const setInputValue = useCallback((newValue: string) => {
    if (independentFieldRef.current) {
      independentFieldRef.current.value = newValue;
      independentFieldRef.current.focus();
    }
  }, []);

  const switchIndependentField = useCallback(() => {
    const newValue =
      independentField === 'asset' ? dependentAmount.amount : assetAmount ?? '';
    setInputValue(newValue);
    setIndependentAmount(newValue);
    setIndependentField(independentField === 'asset' ? 'native' : 'asset');
  }, [assetAmount, dependentAmount, independentField, setInputValue]);

  const setMaxAssetAmount = useCallback(() => {
    const newValue =
      independentField === 'asset'
        ? asset?.balance?.amount
        : convertAmountAndPriceToNativeDisplay(
            asset?.balance?.amount,
            asset?.price?.value || 0,
            currentCurrency,
          ).amount;

    setIndependentAmount(newValue);
    setInputValue(newValue);
  }, [
    asset?.balance?.amount,
    asset?.price?.value,
    currentCurrency,
    independentField,
    setInputValue,
  ]);

  return {
    assetAmount,
    independentAmount,
    independentField,
    independentFieldRef,
    dependentAmount,
    setMaxAssetAmount,
    setIndependentAmount,
    setIndependentField,
    switchIndependentField,
  };
};
