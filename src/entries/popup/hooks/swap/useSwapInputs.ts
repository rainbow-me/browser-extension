import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useBackendNetworksStore } from '~/core/state/backendNetworks/backendNetworks';
import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { ParsedSearchAsset } from '~/core/types/assets';
import { GasFeeLegacyParams, GasFeeParams } from '~/core/types/gas';
import { isNativeAsset } from '~/core/utils/chains';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import {
  addBuffer,
  convertAmountFromNativeValue,
  convertAmountToRawAmount,
  convertRawAmountToBalance,
  handleSignificantDecimals,
  isExceedingMaxCharacters,
  lessThan,
  minus,
  truncateNumber,
} from '~/core/utils/numbers';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { TokenInputRef } from '../../pages/swap/SwapTokenInput/TokenInput';

// The maximum number of characters for the input field.
// This does not include the decimal point.
const MAX_INPUT_CHARACTERS = 11;

const focusOnInput = (inputRef: React.RefObject<HTMLInputElement>) => {
  setTimeout(() => {
    inputRef?.current?.focus();
    inputRef?.current?.scroll({
      left: POPUP_DIMENSIONS.width,
    });
  }, 100);
};

export type IndependentField = 'sellField' | 'buyField' | 'sellNativeField';

export const useSwapInputs = ({
  assetToSell,
  assetToBuy,
  setAssetToSell,
  setAssetToBuy,
  setHasRequestedMaxValueAssetToSell,
  selectedGas,
  inputToOpenOnMount,
  bridge,
}: {
  assetToSell: ParsedSearchAsset | null;
  assetToBuy: ParsedSearchAsset | null;
  setAssetToSell: (asset: ParsedSearchAsset | null) => void;
  setAssetToBuy: (asset: ParsedSearchAsset | null) => void;
  setHasRequestedMaxValueAssetToSell: (hasRequestedMaxValue: boolean) => void;
  selectedGas: GasFeeParams | GasFeeLegacyParams;
  inputToOpenOnMount: 'sell' | 'buy' | null;
  bridge: boolean;
}) => {
  const [assetToSellDropdownClosed, setAssetToSellDropdownClosed] = useState(
    inputToOpenOnMount !== 'sell',
  );
  const [assetToBuyDropdownClosed, setAssetToBuyDropdownClosed] = useState(
    inputToOpenOnMount !== 'buy',
  );
  const [assetToSellValue, setAssetToSellValueState] = useState('');
  const [assetToBuyValue, setAssetToBuyValueState] = useState('');
  const [assetToSellNativeValue, setAssetToSellNativeValue] = useState('');

  // Rounded input values (maximum 12 characters including decimal point)
  const [assetToSellValueRounded, setAssetToSellValueRounded] = useState('');
  const [assetToBuyValueRounded, setAssetToBuyValueRounded] = useState('');

  const supportedChains = useBackendNetworksStore((state) =>
    state.getSupportedChains(),
  );
  const chainsNativeAsset = useBackendNetworksStore((state) =>
    state.getChainsNativeAsset(),
  );

  const maxCharacters = useMemo(
    () =>
      (assetToSell?.symbol?.length || 0) > 3
        ? // In case an asset symbol is 4 characters or more (e.g WETH)
          MAX_INPUT_CHARACTERS - 1
        : MAX_INPUT_CHARACTERS,
    [assetToSell],
  );

  const {
    saveSwapAmount,
    saveSwapField,
    swapField: savedSwapField,
  } = usePopupInstanceStore();

  const assetToSellInputRef = useRef<HTMLInputElement>(null);
  const assetToSellNativeInputRef = useRef<HTMLInputElement>(null);
  const assetToBuyInputRef = useRef<HTMLInputElement>(null);

  const [independentField, setIndependentField] =
    useState<IndependentField>('sellField');
  const [independentValue, setIndependentValue] = useState<string>('');

  const setIndependentFieldIfOccupied = useCallback(
    (field: IndependentField) => {
      if (['sellField', 'sellNativeField'].includes(field) && !assetToSell) {
        return;
      }
      if (field === 'buyField' && !assetToBuy) return;
      saveSwapField({ field });
      setIndependentField(field);
    },
    [assetToBuy, assetToSell, saveSwapField],
  );

  const setAssetToSellValue = useCallback(
    (value: string) => {
      setAssetToSellValueRounded(truncateNumber(value, maxCharacters));
      setAssetToSellValueState(value);
    },
    [maxCharacters],
  );

  const setAssetToBuyValue = useCallback(
    (value: string) => {
      setAssetToBuyValueRounded(truncateNumber(value, maxCharacters));
      setAssetToBuyValueState(value);
    },
    [maxCharacters],
  );

  useEffect(() => {
    if (savedSwapField) {
      setIndependentField(savedSwapField);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAssetToSellInputValue = useCallback(
    (value: string, isInput = true) => {
      setAssetToSellDropdownClosed(true);
      setIndependentFieldIfOccupied('sellField');
      let inputValue = value;
      if (isInput && isExceedingMaxCharacters(value, maxCharacters)) {
        inputValue = truncateNumber(value, maxCharacters);
      }
      saveSwapAmount({ amount: inputValue });
      setAssetToSellValue(inputValue);
      setIndependentValue(inputValue);
    },
    [
      maxCharacters,
      saveSwapAmount,
      setAssetToSellValue,
      setIndependentFieldIfOccupied,
    ],
  );

  const setAssetToSellInputNativeValue = useCallback(
    (value: string) => {
      setAssetToSellDropdownClosed(true);
      setIndependentFieldIfOccupied('sellNativeField');
      setAssetToSellNativeValue(value);
      setIndependentValue(value);
      setAssetToSellValue(
        value
          ? convertAmountFromNativeValue(
              value || 0,
              assetToSell?.price?.value || 0,
              assetToSell?.decimals,
            )
          : '',
      );
      saveSwapAmount({ amount: value });
    },
    [
      assetToSell?.decimals,
      assetToSell?.price?.value,
      saveSwapAmount,
      setAssetToSellValue,
      setIndependentFieldIfOccupied,
    ],
  );

  const setAssetToBuyInputValue = useCallback(
    (value: string, isInput = true) => {
      setAssetToBuyDropdownClosed(true);
      setIndependentFieldIfOccupied('buyField');
      let inputValue = value;
      if (isInput && isExceedingMaxCharacters(value, maxCharacters)) {
        inputValue = truncateNumber(value, maxCharacters);
      }
      setAssetToBuyValue(inputValue);
      setIndependentValue(inputValue);
      saveSwapAmount({ amount: inputValue });
    },
    [
      maxCharacters,
      saveSwapAmount,
      setAssetToBuyValue,
      setIndependentFieldIfOccupied,
    ],
  );

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

    const rawAssetBalanceAmount =
      assetToSell?.isNativeAsset &&
      lessThan(selectedGas?.gasFee?.amount, assetBalanceAmount)
        ? minus(assetBalanceAmount, addBuffer(selectedGas?.gasFee?.amount, 1.3))
        : assetBalanceAmount;

    const assetBalance = convertRawAmountToBalance(rawAssetBalanceAmount, {
      decimals: assetToSell?.decimals || 18,
    });
    return assetBalance;
  }, [
    assetToSell?.balance?.amount,
    assetToSell?.decimals,
    assetToSell?.isNativeAsset,
    selectedGas?.gasFee?.amount,
  ]);

  const setAssetToSellMaxValue = useCallback(() => {
    setAssetToSellValue(assetToSellMaxValue.amount);
    setIndependentValue(assetToSellMaxValue.amount);
    saveSwapAmount({ amount: assetToSellMaxValue.amount });
    setIndependentFieldIfOccupied('sellField');
  }, [
    assetToSellMaxValue.amount,
    setAssetToSellValue,
    saveSwapAmount,
    setIndependentFieldIfOccupied,
  ]);

  const flipAssets = useCallback(() => {
    if (bridge && assetToSell && !assetToBuy) return;
    const isCrosschainSwap =
      assetToSell && assetToBuy && assetToSell.chainId !== assetToBuy.chainId;
    if (isCrosschainSwap) {
      setAssetToBuyValue('');
      setAssetToSellValue(assetToBuyValue);
      setIndependentField('sellField');
      saveSwapField({ field: 'sellField' });
      focusOnInput(assetToSellInputRef);
    } else if (independentField === 'buyField') {
      setAssetToBuyValue('');
      setAssetToSellValue(independentValue);
      setIndependentField('sellField');
      saveSwapField({ field: 'sellField' });
      focusOnInput(assetToSellInputRef);
    } else if (
      independentField === 'sellField' ||
      independentField === 'sellNativeField'
    ) {
      const tokenValue =
        independentField === 'sellNativeField'
          ? assetToSellValue
          : independentValue;
      setAssetToSellValue('');
      setAssetToBuyValue(tokenValue);
      setIndependentValue(tokenValue);
      setAssetToSellNativeValue('');
      setIndependentField('buyField');
      saveSwapField({ field: 'buyField' });
      focusOnInput(assetToBuyInputRef);
    }
    setAssetToBuy(assetToSell);
    setAssetToSell(assetToBuy);
    setAssetToSellDropdownClosed(true);
    setAssetToBuyDropdownClosed(true);
  }, [
    bridge,
    assetToSell,
    assetToBuy,
    independentField,
    setAssetToBuy,
    setAssetToSell,
    setAssetToBuyValue,
    setAssetToSellValue,
    assetToBuyValue,
    saveSwapField,
    independentValue,
    assetToSellValue,
  ]);

  const assetToSellDisplay = useMemo(() => {
    const amount =
      independentField === 'buyField'
        ? assetToSellValue && handleSignificantDecimals(assetToSellValue, 5)
        : assetToSellValue;

    return { amount, display: truncateNumber(amount, maxCharacters) };
  }, [maxCharacters, assetToSellValue, independentField]);

  const assetToBuyDisplay = useMemo(
    () =>
      independentField === 'sellField' || independentField === 'sellNativeField'
        ? assetToBuyValue && handleSignificantDecimals(assetToBuyValue, 5)
        : assetToBuyValue,
    [assetToBuyValue, independentField],
  );

  const determineOutputCurrency = useCallback(
    (asset: ParsedSearchAsset | null) => {
      if (!asset) return null;

      const { chainId } = asset;

      const supportedChain = supportedChains.find(
        (chain) => chain.id === chainId,
      );

      if (!supportedChain) return null;

      if (!isNativeAsset(asset.address, chainId)) {
        const chainNativeAddress = chainsNativeAsset[chainId];
        // Return native asset for this chain
        return {
          uniqueId: `${chainNativeAddress}_${chainId}`,
          address: chainNativeAddress.address,
          chainId,
          isNativeAsset: true,
          ...supportedChain.nativeCurrency,
        };
      }
      return null;
    },
    [chainsNativeAsset, supportedChains],
  );

  const tokenToBuyInputRef = useRef<TokenInputRef>();

  const selectAssetToSell = useCallback(
    (asset: ParsedSearchAsset | null) => {
      setAssetToSell(asset);

      if (asset && !bridge && !isNativeAsset(asset.address, asset.chainId)) {
        const suggestedOutputAsset = determineOutputCurrency(asset);

        if (
          suggestedOutputAsset &&
          !isLowerCaseMatch(suggestedOutputAsset.symbol, asset.symbol)
        ) {
          setAssetToBuy(suggestedOutputAsset as ParsedSearchAsset);
        }
      }

      setAssetToSellValue('');
      setAssetToBuyValue('');

      if (asset) {
        setHasRequestedMaxValueAssetToSell(true);
      }

      if (!assetToBuy) {
        tokenToBuyInputRef.current?.openDropdown();
      }
    },
    [
      setAssetToSellValue,
      setAssetToBuyValue,
      setHasRequestedMaxValueAssetToSell,
      setAssetToSell,
      bridge,
      assetToBuy,
      determineOutputCurrency,
      setAssetToBuy,
    ],
  );

  return {
    assetToBuyInputRef,
    assetToSellInputRef,
    assetToSellNativeInputRef,
    assetToSellMaxValue,
    assetToSellValue,
    assetToSellNativeValue,
    assetToBuyValue,
    assetToSellDisplay,
    assetToBuyDisplay,
    assetToSellDropdownClosed,
    assetToSellValueRounded,
    assetToBuyValueRounded,
    assetToBuyDropdownClosed,
    independentField,
    flipAssets,
    onAssetToSellInputOpen,
    onAssetToBuyInputOpen,
    setAssetToBuyValue,
    setAssetToBuyInputValue,
    setAssetToSellValue,
    setAssetToSellInputValue,
    setAssetToSellInputNativeValue,
    setAssetToSellMaxValue,
    setIndependentField: setIndependentFieldIfOccupied,
    selectAssetToSell,
  };
};
