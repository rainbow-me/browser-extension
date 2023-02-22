import { useCallback, useState } from 'react';

export const useSwapInputs = () => {
  const [tokenToSwapDropdownVisible, setTokenToSwapDropdownVisible] =
    useState(false);
  const [tokenToReceiveDropdownVisible, setTokenToReceiveDropdownVisible] =
    useState(false);

  const onTokenToSwapInputClick = useCallback(
    () =>
      setTokenToSwapDropdownVisible(
        (tokenToSwapDropdownVisible) => !tokenToSwapDropdownVisible,
      ),
    [],
  );
  const onTokenToReceiveInputClick = useCallback(
    () =>
      setTokenToReceiveDropdownVisible(
        (tokenToReceiveDropdownVisible) => !tokenToReceiveDropdownVisible,
      ),
    [],
  );

  return {
    tokenToSwapDropdownVisible,
    tokenToReceiveDropdownVisible,
    onTokenToSwapInputClick,
    onTokenToReceiveInputClick,
  };
};
