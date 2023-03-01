import { useCallback, useMemo, useRef, useState } from 'react';

import { ParsedAddressAsset } from '~/core/types/assets';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import {
  convertAmountToRawAmount,
  convertRawAmountToBalance,
} from '~/core/utils/numbers';

export const useSwapInputs = ({
  assetToSwap,
  assetToReceive,
  setAssetToSwap,
  setAssetToReceive,
}: {
  assetToSwap: ParsedAddressAsset | null;
  assetToReceive: ParsedAddressAsset | null;
  setAssetToSwap: (asset: ParsedAddressAsset | null) => void;
  setAssetToReceive: (asset: ParsedAddressAsset | null) => void;
}) => {
  const [assetToSwapDropdownVisible, setassetToSwapDropdownVisible] =
    useState(false);
  const [assetToReceiveDropdownVisible, setassetToReceiveDropdownVisible] =
    useState(false);
  const [assetToSwapValue, setAssetToSwapStateValue] = useState('');
  const [assetToReceiveValue, setAssetToReceiveStateValue] = useState('');

  const assetToSwapInputRef = useRef<HTMLInputElement>(null);
  const assetToReceieveInputRef = useRef<HTMLInputElement>(null);

  const [independentField, setIndependentField] = useState<
    'toSwap' | 'toReceive'
  >('toSwap');
  const [independetValue, setIndependentValue] = useState<string>('');

  const setAssetToSwapValue = useCallback((value: string) => {
    setAssetToSwapStateValue(value);
    setIndependentField('toSwap');
    setIndependentValue(value);
  }, []);

  const setAssetToReceiveValue = useCallback((value: string) => {
    setAssetToReceiveStateValue(value);
    setIndependentField('toReceive');
    setIndependentValue(value);
  }, []);

  const onAssetToSwapInputOpen = useCallback(
    (assetToSwapDropdownVisible: boolean) => {
      setassetToSwapDropdownVisible(assetToSwapDropdownVisible);
      setassetToReceiveDropdownVisible(false);
    },
    [],
  );
  const onAssetToReceiveInputOpen = useCallback(
    (assetToReceiveDropdownVisible: boolean) => {
      setassetToReceiveDropdownVisible(assetToReceiveDropdownVisible);
      setassetToSwapDropdownVisible(false);
    },
    [],
  );

  const assetToSwapMaxValue = useMemo(() => {
    const assetBalanceAmount = convertAmountToRawAmount(
      assetToSwap?.balance?.amount || '0',
      assetToSwap?.decimals || 18,
    );

    const assetBalance = convertRawAmountToBalance(assetBalanceAmount, {
      decimals: assetToSwap?.decimals || 18,
    });

    return assetBalance;
  }, [assetToSwap?.balance?.amount, assetToSwap?.decimals]);

  const setAssetToSwapMaxValue = useCallback(() => {
    setAssetToSwapValue(assetToSwapMaxValue.amount);
    setTimeout(() => {
      assetToSwapInputRef?.current?.focus();
      assetToSwapInputRef?.current?.scroll({
        left: POPUP_DIMENSIONS.width,
      });
      assetToSwapInputRef?.current?.setSelectionRange(
        assetToSwapMaxValue.amount.length,
        assetToSwapMaxValue.amount.length,
      );
    }, 100);
  }, [assetToSwapMaxValue.amount, setAssetToSwapValue]);

  const flipAssets = useCallback(() => {
    if (independentField === 'toSwap') {
      setAssetToSwapStateValue('');
      setAssetToReceiveValue(independetValue);
      setIndependentField('toReceive');
      assetToReceieveInputRef?.current?.focus();
    } else {
      setAssetToReceiveStateValue('');
      setAssetToSwapValue(independetValue);
      setIndependentField('toSwap');
      assetToSwapInputRef?.current?.focus();
    }
    setAssetToReceive(assetToSwap);
    setAssetToSwap(assetToReceive);
  }, [
    assetToReceive,
    assetToSwap,
    independentField,
    independetValue,
    setAssetToReceive,
    setAssetToReceiveValue,
    setAssetToSwap,
    setAssetToSwapValue,
  ]);

  return {
    assetToReceieveInputRef,
    assetToSwapInputRef,
    assetToSwapMaxValue,
    assetToSwapValue,
    assetToReceiveValue,
    assetToSwapDropdownVisible,
    assetToReceiveDropdownVisible,
    flipAssets,
    onAssetToSwapInputOpen,
    onAssetToReceiveInputOpen,
    setAssetToReceiveValue,
    setAssetToSwapValue,
    setAssetToSwapMaxValue,
  };
};
