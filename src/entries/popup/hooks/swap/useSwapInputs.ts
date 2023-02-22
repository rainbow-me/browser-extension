import { useCallback, useState } from 'react';

export const useSwapInputs = () => {
  const [assetToSwapDropdownVisible, setassetToSwapDropdownVisible] =
    useState(false);
  const [assetToReceiveDropdownVisible, setassetToReceiveDropdownVisible] =
    useState(false);

  const onAssetToSwapInputClick = useCallback(() => {
    setassetToSwapDropdownVisible(
      (assetToSwapDropdownVisible) => !assetToSwapDropdownVisible,
    );
    setassetToReceiveDropdownVisible(false);
  }, []);
  const onAssetToReceiveInputClick = useCallback(() => {
    setassetToReceiveDropdownVisible(
      (assetToReceiveDropdownVisible) => !assetToReceiveDropdownVisible,
    );
    setassetToSwapDropdownVisible(false);
  }, []);

  return {
    assetToSwapDropdownVisible,
    assetToReceiveDropdownVisible,
    onAssetToSwapInputClick,
    onAssetToReceiveInputClick,
  };
};
