import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { SUPPORTED_CHAINS, chainsNativeAsset } from '~/core/references/chains';
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
  lessThan,
  minus,
} from '~/core/utils/numbers';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { TokenInputRef } from '../../pages/swap/SwapTokenInput/TokenInput';

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
  selectedGas,
  inputToOpenOnMount,
  bridge,
}: {
  assetToSell: ParsedSearchAsset | null;
  assetToBuy: ParsedSearchAsset | null;
  setAssetToSell: (asset: ParsedSearchAsset | null) => void;
  setAssetToBuy: (asset: ParsedSearchAsset | null) => void;
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
  const [assetToSellValue, setAssetToSellValue] = useState('');
  const [assetToSellNativeValue, setAssetToSellNativeValue] = useState('');
  const [assetToBuyValue, setAssetToBuyValue] = useState('');

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

  useEffect(() => {
    if (savedSwapField) {
      setIndependentField(savedSwapField);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAssetToSellInputValue = useCallback(
    (value: string) => {
      setAssetToSellDropdownClosed(true);
      saveSwapAmount({ amount: value });
      setAssetToSellValue(value);
      setIndependentFieldIfOccupied('sellField');
      setIndependentValue(value);
    },
    [saveSwapAmount, setIndependentFieldIfOccupied],
  );

  const setAssetToSellInputNativeValue = useCallback(
    (value: string) => {
      setAssetToSellDropdownClosed(true);
      setAssetToSellNativeValue(value);
      setIndependentFieldIfOccupied('sellNativeField');
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
      setIndependentFieldIfOccupied,
    ],
  );

  const setAssetToBuyInputValue = useCallback(
    (value: string) => {
      setAssetToBuyDropdownClosed(true);
      setAssetToBuyValue(value);
      setIndependentFieldIfOccupied('buyField');
      setIndependentValue(value);
      saveSwapAmount({ amount: value });
    },
    [saveSwapAmount, setIndependentFieldIfOccupied],
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
        ? minus(assetBalanceAmount, addBuffer(selectedGas?.gasFee?.amount, 1.1))
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
    assetToBuy,
    assetToBuyValue,
    assetToSell,
    assetToSellValue,
    independentField,
    independentValue,
    saveSwapField,
    setAssetToBuy,
    setAssetToSell,
    setIndependentField,
    bridge,
  ]);

  const assetToSellDisplay = useMemo(
    () =>
      independentField === 'buyField'
        ? assetToSellValue && handleSignificantDecimals(assetToSellValue, 5)
        : assetToSellValue,
    [assetToSellValue, independentField],
  );

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

      const supportedChain = SUPPORTED_CHAINS.find(
        (chain) => chain.id === chainId,
      );

      if (!supportedChain) return null;

      if (!isNativeAsset(asset.address, chainId)) {
        // Return native asset for this chain
        return {
          address: chainsNativeAsset[chainId],
          chainId,
          isNativeAsset: true,
          ...supportedChain.nativeCurrency,
        };
      }
      return null;
    },
    [],
  );

  const tokenToBuyInputRef = useRef<TokenInputRef>();

  const selectAssetToSell = useCallback(
    (asset: ParsedSearchAsset | null) => {
      setAssetToSell(asset);

      if (asset && !bridge && !isNativeAsset(asset.address, asset.chainId)) {
        const suggestedOutputAsset = determineOutputCurrency(
          asset,
        ) as ParsedSearchAsset;
        if (
          suggestedOutputAsset &&
          !isLowerCaseMatch(suggestedOutputAsset.symbol, asset.symbol)
        ) {
          setAssetToBuy(suggestedOutputAsset);
        }
      }

      setAssetToSellValue('');
      setAssetToBuyValue('');

      if (!assetToBuy) {
        tokenToBuyInputRef.current?.openDropdown();
      }
    },
    [
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
