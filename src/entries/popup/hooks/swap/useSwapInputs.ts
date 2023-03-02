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

export type IndependentField = 'toSell' | 'toBuy';

export const useSwapInputs = ({
  assetToSell,
  assetToBuy,
  setAssetToSell,
  setAssetToBuy,
}: {
  assetToSell: ParsedAddressAsset | null;
  assetToBuy: ParsedAddressAsset | null;
  setAssetToSell: (asset: ParsedAddressAsset | null) => void;
  setAssetToBuy: (asset: ParsedAddressAsset | null) => void;
}) => {
  const [assetToSellDropdownClosed, setAssetToSellDropdownClosed] =
    useState(true);
  const [assetToBuyDropdownClosed, setAssetToBuyDropdownClosed] =
    useState(true);
  const [assetToSellValue, setAssetToSellStateValue] = useState('');
  const [assetToBuyValue, setAssetToBuyStateValue] = useState('');

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

  const setAssetToBuyValue = useCallback((value: string) => {
    setAssetToBuyStateValue(value);
    setIndependentField('toBuy');
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
      setAssetToBuyValue(independetValue);
      setIndependentField('toBuy');
      focusOnInput(assetToReceieveInputRef);
    } else {
      setAssetToBuyStateValue('');
      setAssetToSellValue(independetValue);
      setIndependentField('toSell');
      focusOnInput(assetToSellInputRef);
    }
    setAssetToBuy(assetToSell);
    setAssetToSell(assetToBuy);
    setAssetToSellDropdownClosed(true);
    setAssetToBuyDropdownClosed(true);
  }, [
    assetToBuy,
    assetToSell,
    independentField,
    independetValue,
    setAssetToBuy,
    setAssetToBuyValue,
    setAssetToSell,
    setAssetToSellValue,
  ]);

  return {
    assetToReceieveInputRef,
    assetToSellInputRef,
    assetToSellMaxValue,
    assetToSellValue,
    assetToBuyValue,
    assetToSellDropdownClosed,
    assetToBuyDropdownClosed,
    independentField,
    flipAssets,
    onAssetToSellInputOpen,
    onAssetToBuyInputOpen,
    setAssetToBuyValue,
    setAssetToSellValue,
    setAssetToSellMaxValue,
  };
};
