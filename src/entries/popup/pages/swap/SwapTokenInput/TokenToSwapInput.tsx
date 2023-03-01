import React, { useCallback, useRef } from 'react';

import { ParsedAddressAsset } from '~/core/types/assets';
import { SortMethod } from '~/entries/popup/hooks/send/useSendAsset';

import { TokenToSwapDropdown } from './TokenDropdown/TokenToSwapDropdown';
import { TokenToSwapInfo } from './TokenInfo/TokenToSwapInfo';
import { TokenInput } from './TokenInput';

interface SwapTokenInputProps {
  assetToSwapMaxValue: { display: string; amount: string };
  assetToSwapValue: string;
  asset: ParsedAddressAsset | null;
  assetFilter: string;
  assets?: ParsedAddressAsset[];
  dropdownClosed: boolean;
  dropdownHeight?: number;
  placeholder: string;
  sortMethod: SortMethod;
  zIndex?: number;
  inputRef: React.RefObject<HTMLInputElement>;
  onDropdownOpen: (open: boolean) => void;
  setSortMethod: (sortMethod: SortMethod) => void;
  selectAsset: (asset: ParsedAddressAsset | null) => void;
  setAssetFilter: React.Dispatch<React.SetStateAction<string>>;
  setAssetToSwapMaxValue: () => void;
  setAssetToSwapValue: (value: string) => void;
}

export const TokenToSwapInput = ({
  assetToSwapMaxValue,
  asset,
  assetFilter,
  assets,
  dropdownClosed = false,
  dropdownHeight,
  placeholder,
  sortMethod,
  zIndex,
  assetToSwapValue,
  inputRef,
  onDropdownOpen,
  selectAsset,
  setAssetFilter,
  setSortMethod,
  setAssetToSwapMaxValue,
  setAssetToSwapValue,
}: SwapTokenInputProps) => {
  const onSelectAssetRef = useRef<(asset: ParsedAddressAsset) => void>();

  const setOnSelectAsset = useCallback(
    (cb: (asset: ParsedAddressAsset) => void) => {
      onSelectAssetRef.current = (asset: ParsedAddressAsset) => {
        cb(asset);
        selectAsset(asset);
      };
    },
    [selectAsset],
  );

  const onDropdownChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setTimeout(() => inputRef?.current?.focus(), 300);
      }
    },
    [inputRef],
  );

  const setMaxValue = useCallback(() => {
    setAssetToSwapMaxValue();
    setTimeout(() => {
      inputRef?.current?.focus();
      inputRef?.current?.setSelectionRange(
        assetToSwapValue.length - 1,
        assetToSwapValue.length - 1,
        'forward',
      );
    }, 300);
  }, [assetToSwapValue.length, inputRef, setAssetToSwapMaxValue]);

  return (
    <TokenInput
      inputRef={inputRef}
      asset={asset}
      dropdownClosed={dropdownClosed}
      dropdownHeight={dropdownHeight}
      dropdownComponent={
        <TokenToSwapDropdown
          onDropdownChange={onDropdownChange}
          asset={asset}
          assets={assets}
          sortMethod={sortMethod}
          onSelectAsset={onSelectAssetRef?.current}
          setSortMethod={setSortMethod}
        />
      }
      bottomComponent={
        asset ? (
          <TokenToSwapInfo
            assetToSwapValue={assetToSwapValue}
            assetToSwapMaxValue={assetToSwapMaxValue}
            asset={asset}
            setAssetToSwapMaxValue={setMaxValue}
          />
        ) : null
      }
      placeholder={placeholder}
      zIndex={zIndex}
      variant="transparent"
      value={assetToSwapValue}
      onDropdownOpen={onDropdownOpen}
      setOnSelectAsset={setOnSelectAsset}
      selectAsset={selectAsset}
      assetFilter={assetFilter}
      setAssetFilter={setAssetFilter}
      setValue={setAssetToSwapValue}
    />
  );
};
