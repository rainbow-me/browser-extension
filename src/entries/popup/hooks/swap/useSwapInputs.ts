import { useCallback, useMemo, useRef, useState } from 'react';

import { ParsedSearchAsset } from '~/core/types/assets';
import { GasFeeLegacyParams, GasFeeParams } from '~/core/types/gas';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import {
  convertAmountFromNativeValue,
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

export type IndependentField = 'sellField' | 'buyField' | 'sellNativeField';

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
  const [assetToSellNativeValue, setAssetToSellNativeValue] = useState('');
  const [assetToBuyValue, setAssetToBuyValue] = useState('');

  const assetToSellInputRef = useRef<HTMLInputElement>(null);
  const assetToSellNativeInputRef = useRef<HTMLInputElement>(null);
  const assetToBuyInputRef = useRef<HTMLInputElement>(null);

  const [independentField, setIndependentField] =
    useState<IndependentField>('sellField');
  const [independentValue, setIndependentValue] = useState<string>('');

  const setIndependentFieldIfOccupied = useCallback(
    (field: IndependentField) => {
      if (['sellField', 'sellNativeField'].includes(field) && !assetToSell) {
        return;
      }
      if (field === 'buyField' && !assetToBuy) return;
      setIndependentField(field);
    },
    [assetToBuy, assetToSell],
  );

  const setAssetToSellInputValue = useCallback((value: string) => {
    setAssetToSellDropdownClosed(true);
    setAssetToSellValue(value);
    setIndependentField('sellField');
    setIndependentValue(value);
  }, []);

  const setAssetToSellInputNativeValue = useCallback(
    (value: string) => {
      setAssetToSellDropdownClosed(true);
      setAssetToSellNativeValue(value);
      setIndependentFieldIfOccupied('sellNativeField');
      setIndependentValue(value);
      setAssetToSellValue(
        value
          ? convertAmountFromNativeValue(
              value || 0,
              assetToSell?.price?.value || 0,
              assetToSell?.decimals,
            )
          : '',
      );
    },
    [
      assetToSell?.decimals,
      assetToSell?.price?.value,
      setIndependentFieldIfOccupied,
    ],
  );

  const setAssetToBuyInputValue = useCallback(
    (value: string) => {
      setAssetToBuyDropdownClosed(true);
      setAssetToBuyValue(value);
      setIndependentFieldIfOccupied('buyField');
      setIndependentValue(value);
    },
    [setIndependentFieldIfOccupied],
  );

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
    setIndependentFieldIfOccupied('sellField');
  }, [assetToSellMaxValue.amount, setIndependentFieldIfOccupied]);

  const flipAssets = useCallback(() => {
    const isCrosschainSwap =
      assetToSell && assetToBuy && assetToSell.chainId !== assetToBuy.chainId;
    if (isCrosschainSwap) {
      setAssetToBuyValue('');
      setAssetToSellValue(assetToBuyValue);
      setIndependentFieldIfOccupied('sellField');
      focusOnInput(assetToSellInputRef);
    } else if (independentField === 'buyField') {
      setAssetToBuyValue('');
      setAssetToSellValue(independentValue);
      setIndependentFieldIfOccupied('sellField');
      focusOnInput(assetToSellInputRef);
    } else if (
      independentField === 'sellField' ||
      independentField === 'sellNativeField'
    ) {
      setAssetToSellValue('');
      setAssetToBuyValue(
        independentField === 'sellNativeField'
          ? assetToSellValue
          : independentValue,
      );
      setAssetToSellNativeValue('');
      setIndependentFieldIfOccupied('buyField');
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
    assetToSellValue,
    independentField,
    independentValue,
    setAssetToBuy,
    setAssetToSell,
    setIndependentFieldIfOccupied,
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
      independentField === 'sellField' || independentField === 'sellNativeField'
        ? assetToBuyValue && handleSignificantDecimals(assetToBuyValue, 5)
        : assetToBuyValue,
    [assetToBuyValue, independentField],
  );

  return {
    assetToBuyInputRef,
    assetToSellInputRef,
    assetToSellNativeInputRef,
    assetToSellMaxValue,
    assetToSellValue,
    assetToSellNativeValue,
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
    setAssetToSellInputNativeValue,
    setAssetToSellMaxValue,
    setIndependentField: setIndependentFieldIfOccupied,
  };
};
