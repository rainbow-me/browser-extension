import { useCallback, useState } from 'react';

export const useSwapInputs = () => {
  const [tokenToSwapDropdownVisible, setTokenToSwapDropdownVisible] =
    useState(false);
  const [tokenToReceiveDropdownVisible, setTokenToReceiveDropdownVisible] =
    useState(false);

  const onTokenToSwapInputClick = useCallback(() => {
    setTokenToSwapDropdownVisible(
      (tokenToSwapDropdownVisible) => !tokenToSwapDropdownVisible,
    );
    setTokenToReceiveDropdownVisible(false);
  }, []);
  const onTokenToReceiveInputClick = useCallback(() => {
    setTokenToReceiveDropdownVisible(
      (tokenToReceiveDropdownVisible) => !tokenToReceiveDropdownVisible,
    );
    setTokenToSwapDropdownVisible(false);
  }, []);

  return {
    tokenToSwapDropdownVisible,
    tokenToReceiveDropdownVisible,
    onTokenToSwapInputClick,
    onTokenToReceiveInputClick,
  };
};
