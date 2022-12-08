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
  const [independentAmount, setIndependentAmount] = useState<string>();
  const [independentField, setIndependentField] = useState<'native' | 'asset'>(
    'asset',
  );
  const independentFieldRef = useRef(null);

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

  const setMaxAssetAmount = useCallback(() => {
    // const rawAmount = convertAmountToRawAmount(
    //   asset.balance.amount,
    //   asset.decimals,
    // );

    setIndependentAmount(asset.balance.amount);

    (independentFieldRef?.current as unknown as HTMLInputElement).value =
      asset.balance.amount;
    (independentFieldRef?.current as unknown as HTMLInputElement).focus();
  }, [asset.balance]);

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
