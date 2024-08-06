import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { ParsedSearchAsset } from '~/core/types/assets';
import { GasFeeLegacyParams, GasFeeParams } from '~/core/types/gas';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import {
  addBuffer,
  convertAmountFromNativeValue,
  convertAmountToRawAmount,
  convertRawAmountToBalance,
  handleSignificantDecimals,
  isExceedingMaxCharacters,
  lessThan,
  minus,
  truncateNumber,
} from '~/core/utils/numbers';

// The maximum number of characters for the input field.
// This does not include the decimal point.
const MAX_INPUT_CHARACTERS = 11;

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
  bridge,
}: {
  assetToSell: ParsedSearchAsset | null;
  assetToBuy: ParsedSearchAsset | null;
  setAssetToSell: (asset: ParsedSearchAsset | null) => void;
  setAssetToBuy: (asset: ParsedSearchAsset | null) => void;
  selectedGas: GasFeeParams | GasFeeLegacyParams;
  inputToOpenOnMount: 'sell' | 'buy' | null;
  bridge: boolean;
}) => {
  const [assetToSellDropdownClosed, setAssetToSellDropdownClosed] = useState(
    inputToOpenOnMount !== 'sell',
  );
  const [assetToBuyDropdownClosed, setAssetToBuyDropdownClosed] = useState(
    inputToOpenOnMount !== 'buy',
  );
  const [assetToSellValue, setAssetToSellValueState] = useState('');
  const [assetToBuyValue, setAssetToBuyValueState] = useState('');
  const [assetToSellNativeValue, setAssetToSellNativeValue] = useState('');

  // Rounded input values (maximum 12 characters including decimal point)
  const [assetToSellValueRounded, setAssetToSellValueRounded] = useState('');
  const [assetToBuyValueRounded, setAssetToBuyValueRounded] = useState('');

  const {
    saveSwapAmount,
    saveSwapField,
    swapField: savedSwapField,
  } = usePopupInstanceStore();

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
      saveSwapField({ field });
      setIndependentField(field);
    },
    [assetToBuy, assetToSell, saveSwapField],
  );

  const setAssetToSellValue = useCallback((value: string) => {
    setAssetToSellValueRounded(truncateNumber(value, MAX_INPUT_CHARACTERS));
    setAssetToSellValueState(value);
  }, []);

  const setAssetToBuyValue = useCallback((value: string) => {
    setAssetToBuyValueRounded(truncateNumber(value, MAX_INPUT_CHARACTERS));
    setAssetToBuyValueState(value);
  }, []);

  useEffect(() => {
    if (savedSwapField) {
      setIndependentField(savedSwapField);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAssetToSellInputValue = useCallback(
    (value: string, isInput = true) => {
      setAssetToSellDropdownClosed(true);
      setIndependentFieldIfOccupied('sellField');
      let inputValue = value;
      if (isInput && isExceedingMaxCharacters(value, MAX_INPUT_CHARACTERS)) {
        inputValue = truncateNumber(value, MAX_INPUT_CHARACTERS);
      }
      saveSwapAmount({ amount: inputValue });
      setAssetToSellValue(inputValue);
      setIndependentValue(inputValue);
    },
    [saveSwapAmount, setAssetToSellValue, setIndependentFieldIfOccupied],
  );

  const setAssetToSellInputNativeValue = useCallback(
    (value: string) => {
      setAssetToSellDropdownClosed(true);
      setIndependentFieldIfOccupied('sellNativeField');
      setAssetToSellNativeValue(value);
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
      saveSwapAmount({ amount: value });
    },
    [
      assetToSell?.decimals,
      assetToSell?.price?.value,
      saveSwapAmount,
      setAssetToSellValue,
      setIndependentFieldIfOccupied,
    ],
  );

  const setAssetToBuyInputValue = useCallback(
    (value: string, isInput = true) => {
      setAssetToBuyDropdownClosed(true);
      setIndependentFieldIfOccupied('buyField');
      let inputValue = value;
      if (isInput && isExceedingMaxCharacters(value, MAX_INPUT_CHARACTERS)) {
        inputValue = truncateNumber(value, MAX_INPUT_CHARACTERS);
      }
      setAssetToBuyValue(inputValue);
      setIndependentValue(inputValue);
      saveSwapAmount({ amount: inputValue });
    },
    [saveSwapAmount, setAssetToBuyValue, setIndependentFieldIfOccupied],
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
        ? minus(assetBalanceAmount, addBuffer(selectedGas?.gasFee?.amount, 1.1))
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
    saveSwapAmount({ amount: assetToSellMaxValue.amount });
    setIndependentFieldIfOccupied('sellField');
  }, [
    assetToSellMaxValue.amount,
    setAssetToSellValue,
    saveSwapAmount,
    setIndependentFieldIfOccupied,
  ]);

  const flipAssets = useCallback(() => {
    if (bridge && assetToSell && !assetToBuy) return;
    const isCrosschainSwap =
      assetToSell && assetToBuy && assetToSell.chainId !== assetToBuy.chainId;
    if (isCrosschainSwap) {
      setAssetToBuyValue('');
      setAssetToSellValue(assetToBuyValue);
      setIndependentField('sellField');
      saveSwapField({ field: 'sellField' });
      focusOnInput(assetToSellInputRef);
    } else if (independentField === 'buyField') {
      setAssetToBuyValue('');
      setAssetToSellValue(independentValue);
      setIndependentField('sellField');
      saveSwapField({ field: 'sellField' });
      focusOnInput(assetToSellInputRef);
    } else if (
      independentField === 'sellField' ||
      independentField === 'sellNativeField'
    ) {
      const tokenValue =
        independentField === 'sellNativeField'
          ? assetToSellValue
          : independentValue;
      setAssetToSellValue('');
      setAssetToBuyValue(tokenValue);
      setIndependentValue(tokenValue);
      setAssetToSellNativeValue('');
      setIndependentField('buyField');
      saveSwapField({ field: 'buyField' });
      focusOnInput(assetToBuyInputRef);
    }
    setAssetToBuy(assetToSell);
    setAssetToSell(assetToBuy);
    setAssetToSellDropdownClosed(true);
    setAssetToBuyDropdownClosed(true);
  }, [
    bridge,
    assetToSell,
    assetToBuy,
    independentField,
    setAssetToBuy,
    setAssetToSell,
    setAssetToBuyValue,
    setAssetToSellValue,
    assetToBuyValue,
    saveSwapField,
    independentValue,
    assetToSellValue,
  ]);

  const assetToSellDisplay = useMemo(() => {
    const amount =
      independentField === 'buyField'
        ? assetToSellValue && handleSignificantDecimals(assetToSellValue, 5)
        : assetToSellValue;

    return { amount, display: truncateNumber(amount, MAX_INPUT_CHARACTERS) };
  }, [assetToSellValue, independentField]);

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
    assetToSellValueRounded,
    assetToBuyValueRounded,
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
