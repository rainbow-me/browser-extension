import { useCallback, useMemo, useState } from 'react';

import { ParsedAddressAsset } from '~/core/types/assets';
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
  }, [assetToSwapMaxValue.amount, setAssetToSwapValue]);

  const flipAssets = useCallback(() => {
    if (independentField === 'toSwap') {
      setAssetToSwapStateValue('');
      setAssetToReceiveValue(independetValue);
      setIndependentField('toReceive');
    } else {
      setAssetToReceiveStateValue('');
      setAssetToSwapValue(independetValue);
      setIndependentField('toSwap');
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
