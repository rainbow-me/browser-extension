import { useCallback, useMemo, useRef, useState } from 'react';

import { ParsedAddressAsset } from '~/core/types/assets';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import {
  convertAmountToRawAmount,
  convertRawAmountToBalance,
} from '~/core/utils/numbers';

const focusOnInput = (inputRef: React.RefObject<HTMLInputElement>) => {
  setTimeout(() => {
    inputRef?.current?.focus();
    inputRef?.current?.scroll({
      left: POPUP_DIMENSIONS.width,
    });
  }, 100);
};

export type IndependentField = 'toSell' | 'toReceive';

export const useSwapInputs = ({
  assetToSell,
  assetToReceive,
  setAssetToSell,
  setAssetToReceive,
}: {
  assetToSell: ParsedAddressAsset | null;
  assetToReceive: ParsedAddressAsset | null;
  setAssetToSell: (asset: ParsedAddressAsset | null) => void;
  setAssetToReceive: (asset: ParsedAddressAsset | null) => void;
}) => {
  const [assetToSellDropdownClosed, setAssetToSellDropdownClosed] =
    useState(true);
  const [assetToReceiveDropdownClosed, setAssetToReceiveDropdownClosed] =
    useState(true);
  const [assetToSellValue, setAssetToSellStateValue] = useState('');
  const [assetToReceiveValue, setAssetToReceiveStateValue] = useState('');

  const assetToSellInputRef = useRef<HTMLInputElement>(null);
  const assetToReceieveInputRef = useRef<HTMLInputElement>(null);

  const [independentField, setIndependentField] =
    useState<IndependentField>('toSell');
  const [independetValue, setIndependentValue] = useState<string>('');

  const setAssetToSellValue = useCallback((value: string) => {
    setAssetToSellStateValue(value);
    setIndependentField('toSell');
    setIndependentValue(value);
  }, []);

  const setAssetToReceiveValue = useCallback((value: string) => {
    setAssetToReceiveStateValue(value);
    setIndependentField('toReceive');
    setIndependentValue(value);
  }, []);

  const onAssetToSellInputOpen = useCallback(
    (assetToSellDropdownVisible: boolean) => {
      setAssetToSellDropdownClosed(!assetToSellDropdownVisible);
      setAssetToReceiveDropdownClosed(true);
    },
    [],
  );
  const onAssetToReceiveInputOpen = useCallback(
    (assetToReceiveDropdownVisible: boolean) => {
      setAssetToSellDropdownClosed(true);
      setAssetToReceiveDropdownClosed(!assetToReceiveDropdownVisible);
    },
    [],
  );

  const assetToSellMaxValue = useMemo(() => {
    const assetBalanceAmount = convertAmountToRawAmount(
      assetToSell?.balance?.amount || '0',
      assetToSell?.decimals || 18,
    );

    const assetBalance = convertRawAmountToBalance(assetBalanceAmount, {
      decimals: assetToSell?.decimals || 18,
    });

    return assetBalance;
  }, [assetToSell?.balance?.amount, assetToSell?.decimals]);

  const setAssetToSellMaxValue = useCallback(() => {
    setAssetToSellValue(assetToSellMaxValue.amount);
    focusOnInput(assetToSellInputRef);
    setTimeout(() => {
      assetToSellInputRef?.current?.setSelectionRange(
        assetToSellMaxValue.amount.length,
        assetToSellMaxValue.amount.length,
      );
    }, 100);
  }, [assetToSellMaxValue.amount, setAssetToSellValue]);

  const flipAssets = useCallback(() => {
    if (independentField === 'toSell') {
      setAssetToSellStateValue('');
      setAssetToReceiveValue(independetValue);
      setIndependentField('toReceive');
      focusOnInput(assetToReceieveInputRef);
    } else {
      setAssetToReceiveStateValue('');
      setAssetToSellValue(independetValue);
      setIndependentField('toSell');
      focusOnInput(assetToSellInputRef);
    }
    setAssetToReceive(assetToSell);
    setAssetToSell(assetToReceive);
    setAssetToSellDropdownClosed(true);
    setAssetToReceiveDropdownClosed(true);
  }, [
    assetToReceive,
    assetToSell,
    independentField,
    independetValue,
    setAssetToReceive,
    setAssetToReceiveValue,
    setAssetToSell,
    setAssetToSellValue,
  ]);

  return {
    assetToReceieveInputRef,
    assetToSellInputRef,
    assetToSellMaxValue,
    assetToSellValue,
    assetToReceiveValue,
    assetToSellDropdownClosed,
    assetToReceiveDropdownClosed,
    independentField,
    flipAssets,
    onAssetToSellInputOpen,
    onAssetToReceiveInputOpen,
    setAssetToReceiveValue,
    setAssetToSellValue,
    setAssetToSellMaxValue,
  };
};
