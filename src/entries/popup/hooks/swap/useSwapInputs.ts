import { useCallback, useMemo, useRef, useState } from 'react';

import { ParsedSearchAsset } from '~/core/types/assets';
import { GasFeeLegacyParams, GasFeeParams } from '~/core/types/gas';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import {
  convertAmountToRawAmount,
  convertRawAmountToBalance,
  handleSignificantDecimals,
  lessThan,
  minus,
} from '~/core/utils/numbers';

const focusOnInput = (inputRef: React.RefObject<HTMLInputElement>) => {
  setTimeout(() => {
    inputRef?.current?.focus();
    inputRef?.current?.scroll({
      left: POPUP_DIMENSIONS.width,
    });
  }, 100);
};

export type IndependentField = 'sellField' | 'buyField';

export const useSwapInputs = ({
  assetToSell,
  assetToBuy,
  setAssetToSell,
  setAssetToBuy,
  selectedGas,
  inputToOpenOnMount,
}: {
  assetToSell: ParsedSearchAsset | null;
  assetToBuy: ParsedSearchAsset | null;
  setAssetToSell: (asset: ParsedSearchAsset | null) => void;
  setAssetToBuy: (asset: ParsedSearchAsset | null) => void;
  selectedGas: GasFeeParams | GasFeeLegacyParams;
  inputToOpenOnMount: 'sell' | 'buy' | null;
}) => {
  const [assetToSellDropdownClosed, setAssetToSellDropdownClosed] = useState(
    inputToOpenOnMount !== 'sell',
  );
  const [assetToBuyDropdownClosed, setAssetToBuyDropdownClosed] = useState(
    inputToOpenOnMount !== 'buy',
  );
  const [assetToSellValue, setAssetToSellValue] = useState('');
  const [assetToBuyValue, setAssetToBuyValue] = useState('');

  const assetToSellInputRef = useRef<HTMLInputElement>(null);
  const assetToBuyInputRef = useRef<HTMLInputElement>(null);

  const [independentField, setIndependentField] =
    useState<IndependentField>('sellField');
  const [independentValue, setIndependentValue] = useState<string>('');

  const setAssetToSellInputValue = useCallback((value: string) => {
    setAssetToSellDropdownClosed(true);
    setAssetToSellValue(value);
    setIndependentField('sellField');
    setIndependentValue(value);
  }, []);

  const setAssetToBuyInputValue = useCallback((value: string) => {
    setAssetToBuyDropdownClosed(true);
    setAssetToBuyValue(value);
    setIndependentField('buyField');
    setIndependentValue(value);
  }, []);

  const onAssetToSellInputOpen = useCallback(
    (assetToSellDropdownVisible: boolean) => {
      setAssetToSellDropdownClosed(!assetToSellDropdownVisible);
      setAssetToBuyDropdownClosed(true);
    },
    [],
  );

  const onAssetToBuyInputOpen = useCallback(
    (assetToBuyDropdownVisible: boolean) => {
      setAssetToSellDropdownClosed(true);
      setAssetToBuyDropdownClosed(!assetToBuyDropdownVisible);
    },
    [],
  );

  const assetToSellMaxValue = useMemo(() => {
    const assetBalanceAmount = convertAmountToRawAmount(
      assetToSell?.balance?.amount || '0',
      assetToSell?.decimals || 18,
    );

    const rawAssetBalanceAmount =
      assetToSell?.isNativeAsset &&
      lessThan(selectedGas?.gasFee?.amount, assetBalanceAmount)
        ? minus(assetBalanceAmount, selectedGas?.gasFee?.amount)
        : assetBalanceAmount;

    const assetBalance = convertRawAmountToBalance(rawAssetBalanceAmount, {
      decimals: assetToSell?.decimals || 18,
    });
    return assetBalance;
  }, [
    assetToSell?.balance?.amount,
    assetToSell?.decimals,
    assetToSell?.isNativeAsset,
    selectedGas?.gasFee?.amount,
  ]);

  const setAssetToSellMaxValue = useCallback(() => {
    setAssetToSellValue(assetToSellMaxValue.amount);
    setIndependentValue(assetToSellMaxValue.amount);
    setIndependentField('sellField');
  }, [assetToSellMaxValue.amount, setAssetToSellValue]);

  const flipAssets = useCallback(() => {
    const isCrosschainSwap =
      assetToSell && assetToBuy && assetToSell.chainId !== assetToBuy.chainId;
    if (isCrosschainSwap) {
      setAssetToBuyValue('');
      setAssetToSellValue(assetToBuyValue);
      setIndependentField('sellField');
      focusOnInput(assetToSellInputRef);
    } else if (independentField === 'buyField') {
      setAssetToBuyValue('');
      setAssetToSellValue(independentValue);
      setIndependentField('sellField');
      focusOnInput(assetToSellInputRef);
    } else {
      setAssetToSellValue('');
      setAssetToBuyValue(independentValue);
      setIndependentField('buyField');
      focusOnInput(assetToBuyInputRef);
    }
    setAssetToBuy(assetToSell);
    setAssetToSell(assetToBuy);
    setAssetToSellDropdownClosed(true);
    setAssetToBuyDropdownClosed(true);
  }, [
    assetToBuy,
    assetToBuyValue,
    assetToSell,
    independentField,
    independentValue,
    setAssetToBuy,
    setAssetToSell,
  ]);

  const assetToSellDisplay = useMemo(
    () =>
      independentField === 'buyField'
        ? assetToSellValue && handleSignificantDecimals(assetToSellValue, 5)
        : assetToSellValue,
    [assetToSellValue, independentField],
  );

  const assetToBuyDisplay = useMemo(
    () =>
      independentField === 'sellField'
        ? assetToBuyValue && handleSignificantDecimals(assetToBuyValue, 5)
        : assetToBuyValue,
    [assetToBuyValue, independentField],
  );

  return {
    assetToBuyInputRef,
    assetToSellInputRef,
    assetToSellMaxValue,
    assetToSellValue,
    assetToBuyValue,
    assetToSellDisplay,
    assetToBuyDisplay,
    assetToSellDropdownClosed,
    assetToBuyDropdownClosed,
    independentField,
    flipAssets,
    onAssetToSellInputOpen,
    onAssetToBuyInputOpen,
    setAssetToBuyValue,
    setAssetToBuyInputValue,
    setAssetToSellValue,
    setAssetToSellInputValue,
    setAssetToSellMaxValue,
  };
};
