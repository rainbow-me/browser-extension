import { useCallback, useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { ParsedAddressAsset } from '~/core/types/assets';
import {
  convertAmountToRawAmount,
  convertRawAmountToBalance,
} from '~/core/utils/numbers';

export const useSwapInputs = ({
  assetToSwap,
  assetToReceive,
  setAssetToSwapAddress,
  setAssetToReceiveAddress,
}: {
  assetToSwap?: ParsedAddressAsset;
  assetToReceive?: ParsedAddressAsset;
  setAssetToSwapAddress: (address: Address) => void;
  setAssetToReceiveAddress: (address: Address) => void;
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

  const flipAssets = useCallback(() => {
    assetToSwap && setAssetToSwapAddress(assetToSwap.address);
    assetToReceive && setAssetToReceiveAddress(assetToReceive.address);
  }, [
    assetToReceive,
    assetToSwap,
    setAssetToReceiveAddress,
    setAssetToSwapAddress,
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
