import { useCallback, useMemo, useRef, useState } from 'react';

import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedAddressAsset } from '~/core/types/assets';
import {
  convertAmountAndPriceToNativeDisplay,
  convertAmountFromNativeValue,
} from '~/core/utils/numbers';

export const useSendTransactionInputs = ({
  asset,
}: {
  asset: ParsedAddressAsset;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  const independentFieldRef = useRef(null);
  const [independentAmount, setIndependentAmount] = useState<string>('');
  const [independentField, setIndependentField] = useState<'native' | 'asset'>(
    'asset',
  );

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

  const setInputValue = useCallback((newValue: string) => {
    (independentFieldRef?.current as unknown as HTMLInputElement).value =
      newValue;
    (independentFieldRef?.current as unknown as HTMLInputElement).focus();
  }, []);

  const switchIndependentField = useCallback(() => {
    const newValue =
      independentField === 'asset' ? dependentAmount : assetAmount ?? '';
    setInputValue(newValue);
    setIndependentAmount(newValue);
    setIndependentField(independentField === 'asset' ? 'native' : 'asset');
  }, [assetAmount, dependentAmount, independentField, setInputValue]);

  const setMaxAssetAmount = useCallback(() => {
    // const rawAmount = convertAmountToRawAmount(
    //   asset.balance.amount,
    //   asset.decimals,
    // );

    const newValue =
      independentField === 'asset'
        ? asset.balance.amount
        : convertAmountAndPriceToNativeDisplay(
            asset.balance.amount,
            asset?.price?.value || 0,
            currentCurrency,
          ).amount;

    setIndependentAmount(newValue);
    setInputValue(newValue);
  }, [
    asset.balance.amount,
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
