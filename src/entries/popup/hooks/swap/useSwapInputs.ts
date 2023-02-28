import { useCallback, useMemo, useState } from 'react';

import { ParsedAddressAsset } from '~/core/types/assets';
import {
  convertAmountToRawAmount,
  convertRawAmountToBalance,
} from '~/core/utils/numbers';

export const useSwapInputs = ({
  assetToSwap,
}: // assetToReceive,
{
  assetToSwap?: ParsedAddressAsset;
  assetToReceive?: ParsedAddressAsset;
}) => {
  const [assetToSwapDropdownVisible, setassetToSwapDropdownVisible] =
    useState(false);
  const [assetToReceiveDropdownVisible, setassetToReceiveDropdownVisible] =
    useState(false);
  const [assetToSwapValue, setAssetToSwapValue] = useState('');
  const [assetToReceiveValue, setAssetToReceiveValue] = useState('');

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
  }, [assetToSwapMaxValue.amount]);

  return {
    assetToSwapMaxValue,
    assetToSwapValue,
    assetToReceiveValue,
    assetToSwapDropdownVisible,
    assetToReceiveDropdownVisible,
    onAssetToSwapInputOpen,
    onAssetToReceiveInputOpen,
    setAssetToReceiveValue,
    setAssetToSwapValue,
    setAssetToSwapMaxValue,
  };
};
