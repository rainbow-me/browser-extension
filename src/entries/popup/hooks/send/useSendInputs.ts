import { useCallback, useMemo, useRef, useState } from 'react';

import { supportedCurrencies } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { ParsedUserAsset } from '~/core/types/assets';
import { GasFeeLegacyParams, GasFeeParams } from '~/core/types/gas';
import {
  convertAmountAndPriceToNativeDisplay,
  convertAmountFromNativeValue,
  convertAmountToBalanceDisplay,
  convertAmountToRawAmount,
  convertNumberToString,
  convertRawAmountToBalance,
  lessThan,
  minus,
  multiply,
  toFixedDecimals,
} from '~/core/utils/numbers';

export const useSendInputs = ({
  asset,
  selectedGas,
}: {
  asset: ParsedUserAsset | null;
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

  const { saveSendAmount, saveSendField } = usePopupInstanceStore();
  const assetAmount = useMemo(() => {
    const amount =
      independentField === 'asset'
        ? independentAmount
        : dependentAmountDisplay?.amount;
    saveSendField({ field: independentField });
    saveSendAmount({ amount: independentAmount });
    return amount;
  }, [
    dependentAmountDisplay,
    independentAmount,
    independentField,
    saveSendAmount,
    saveSendField,
  ]);

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

  const rawMaxAssetBalanceAmount = useMemo(() => {
    const assetBalanceAmount = convertAmountToRawAmount(
      asset?.balance?.amount || '0',
      asset?.decimals || 18,
    );
    const rawAssetBalanceAmount =
      asset?.isNativeAsset &&
      lessThan(selectedGas?.gasFee?.amount, assetBalanceAmount)
        ? minus(assetBalanceAmount, multiply(selectedGas?.gasFee?.amount, 1))
        : assetBalanceAmount;
    return rawAssetBalanceAmount;
  }, [
    asset?.balance?.amount,
    asset?.decimals,
    asset?.isNativeAsset,
    selectedGas?.gasFee?.amount,
  ]);

  const setMaxAssetAmount = useCallback(() => {
    const assetBalanceAmount = convertAmountToRawAmount(
      asset?.balance?.amount || '0',
      asset?.decimals || 18,
    );

    const rawAssetBalanceAmount =
      asset?.isNativeAsset &&
      lessThan(selectedGas?.gasFee?.amount, assetBalanceAmount)
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
    selectedGas,
    setInputValue,
  ]);

  return {
    assetAmount,
    rawMaxAssetBalanceAmount,
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
