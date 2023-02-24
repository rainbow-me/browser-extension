import { useCallback, useState } from 'react';

export const useSwapInputs = () => {
  const [assetToSwapDropdownVisible, setassetToSwapDropdownVisible] =
    useState(false);
  const [assetToReceiveDropdownVisible, setassetToReceiveDropdownVisible] =
    useState(false);

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

  return {
    assetToSwapDropdownVisible,
    assetToReceiveDropdownVisible,
    onAssetToSwapInputOpen,
    onAssetToReceiveInputOpen,
  };
};
