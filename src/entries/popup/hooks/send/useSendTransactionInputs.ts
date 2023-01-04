import { useCallback, useMemo, useRef, useState } from 'react';

import { supportedCurrencies } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedAddressAsset } from '~/core/types/assets';
import {
  convertAmountAndPriceToNativeDisplay,
  convertAmountFromNativeValue,
  convertAmountToBalanceDisplay,
  convertNumberToString,
  toFixedDecimals,
} from '~/core/utils/numbers';

export const useSendTransactionInputs = ({
  asset,
}: {
  asset: ParsedAddressAsset | null;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  const independentFieldRef = useRef<HTMLInputElement>(null);
  const [independentAmount, setIndependentAmount] = useState<string>('');
  const [independentField, setIndependentField] = useState<'native' | 'asset'>(
    'asset',
  );

  const dependentAmountDisplay = useMemo(() => {
    if (independentField === 'asset') {
      const nativeDisplay = convertAmountAndPriceToNativeDisplay(
        (independentAmount as string) || '0',
        asset?.price?.value || 0,
        currentCurrency,
      );

      const amount = convertNumberToString(
        toFixedDecimals(
          nativeDisplay.amount,
          supportedCurrencies[currentCurrency].decimals,
        ),
      );

      return {
        display: nativeDisplay.display,
        amount: amount === '0' ? '' : amount,
      };
    } else {
      const amountFromNativeValue = convertAmountFromNativeValue(
        (independentAmount as string) || '0',
        asset?.price?.value || 0,
        asset?.decimals,
      );
      return {
        display: convertAmountToBalanceDisplay(
          amountFromNativeValue,
          asset ?? { decimals: 18, symbol: '' },
        ),
        amount: amountFromNativeValue === '0' ? '' : amountFromNativeValue,
      };
    }
  }, [asset, currentCurrency, independentAmount, independentField]);

  const independentAmountDisplay = useMemo(() => {
    if (independentField === 'asset') {
      return {
        display: `${independentAmount} ${asset?.symbol}`,
        amount: independentAmount,
      };
    } else {
      const currencySelected = supportedCurrencies?.[currentCurrency];
      const display =
        currencySelected.alignment === 'left'
          ? `${currencySelected.symbol}${independentAmount}`
          : `${independentAmount} ${currencySelected.symbol}`;

      return {
        display,
        amount: independentAmount,
      };
    }
  }, [asset, currentCurrency, independentAmount, independentField]);

  const assetAmount = useMemo(
    () =>
      independentField === 'asset'
        ? independentAmount
        : dependentAmountDisplay.amount,
    [dependentAmountDisplay, independentAmount, independentField],
  );

  const setInputValue = useCallback((newValue: string) => {
    if (independentFieldRef.current) {
      independentFieldRef.current.value = newValue;
      independentFieldRef.current.focus();
    }
  }, []);

  const switchIndependentField = useCallback(() => {
    const newValue =
      independentField === 'asset'
        ? dependentAmountDisplay.amount
        : assetAmount ?? '';
    setInputValue(newValue);
    setIndependentAmount(newValue);
    setIndependentField(independentField === 'asset' ? 'native' : 'asset');
  }, [assetAmount, dependentAmountDisplay, independentField, setInputValue]);

  const setMaxAssetAmount = useCallback(() => {
    const newValue =
      independentField === 'asset'
        ? asset?.balance?.amount || '0'
        : convertNumberToString(
            toFixedDecimals(
              convertAmountAndPriceToNativeDisplay(
                asset?.balance?.amount || 0,
                asset?.price?.value || 0,
                currentCurrency,
              ).amount,
              supportedCurrencies[currentCurrency].decimals,
            ),
          );

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
    dependentAmountDisplay,
    independentAmountDisplay,
    setMaxAssetAmount,
    setIndependentAmount,
    setIndependentField,
    switchIndependentField,
  };
};
