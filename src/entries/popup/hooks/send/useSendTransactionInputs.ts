import { useCallback, useMemo, useRef, useState } from 'react';

import { supportedCurrencies } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedAddressAsset } from '~/core/types/assets';
import { GasFeeLegacyParams, GasFeeParams } from '~/core/types/gas';
import {
  convertAmountAndPriceToNativeDisplay,
  convertAmountFromNativeValue,
  convertAmountToBalanceDisplay,
  convertAmountToRawAmount,
  convertNumberToString,
  convertRawAmountToBalance,
  minus,
  toFixedDecimals,
} from '~/core/utils/numbers';

export const useSendTransactionInputs = ({
  asset,
  selectedGas,
}: {
  asset: ParsedAddressAsset | null;
  selectedGas: GasFeeParams | GasFeeLegacyParams;
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
          nativeDisplay?.amount,
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
        : dependentAmountDisplay?.amount,
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
        ? dependentAmountDisplay?.amount
        : assetAmount ?? '';
    setInputValue(newValue);
    setIndependentAmount(newValue);
    setIndependentField(independentField === 'asset' ? 'native' : 'asset');
  }, [assetAmount, dependentAmountDisplay, independentField, setInputValue]);

  const setMaxAssetAmount = useCallback(() => {
    const assetBalanceAmount = convertAmountToRawAmount(
      asset?.balance?.amount || '0',
      asset?.decimals || 18,
    );
    const rawAssetBalanceAmount = asset?.isNativeAsset
      ? minus(assetBalanceAmount, selectedGas?.gasFee?.amount)
      : assetBalanceAmount;

    const assetBalance = convertRawAmountToBalance(rawAssetBalanceAmount, {
      decimals: asset?.decimals || 18,
    });

    const newValue =
      independentField === 'asset'
        ? assetBalance?.amount
        : convertNumberToString(
            toFixedDecimals(
              convertAmountAndPriceToNativeDisplay(
                assetBalance?.amount,
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
    asset?.decimals,
    asset?.isNativeAsset,
    asset?.price?.value,
    currentCurrency,
    independentField,
    selectedGas?.gasFee?.amount,
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
