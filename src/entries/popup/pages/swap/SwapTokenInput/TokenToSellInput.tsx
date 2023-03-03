import React, { useCallback, useRef } from 'react';

import { ParsedAddressAsset } from '~/core/types/assets';
import { SortMethod } from '~/entries/popup/hooks/send/useSendAsset';

import { TokenToSellDropdown } from './TokenDropdown/TokenToSellDropdown';
import { TokenToSellInfo } from './TokenInfo/TokenToSellInfo';
import { TokenInput } from './TokenInput';

interface SwapTokenInputProps {
  assetToSellMaxValue: { display: string; amount: string };
  assetToSellValue: string;
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
  setAssetToSellMaxValue: () => void;
  setAssetToSellInputValue: (value: string) => void;
}

export const TokenToSellInput = ({
  assetToSellMaxValue,
  asset,
  assetFilter,
  assets,
  dropdownClosed = false,
  dropdownHeight,
  placeholder,
  sortMethod,
  zIndex,
  assetToSellValue,
  inputRef,
  onDropdownOpen,
  selectAsset,
  setAssetFilter,
  setSortMethod,
  setAssetToSellMaxValue,
  setAssetToSellInputValue,
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
    setAssetToSellMaxValue();
  }, [setAssetToSellMaxValue]);

  return (
    <TokenInput
      inputRef={inputRef}
      asset={asset}
      dropdownClosed={dropdownClosed}
      dropdownHeight={dropdownHeight}
      dropdownComponent={
        <TokenToSellDropdown
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
          <TokenToSellInfo
            assetToSellValue={assetToSellValue}
            assetToSellMaxValue={assetToSellMaxValue}
            asset={asset}
            setAssetToSellMaxValue={setMaxValue}
          />
        ) : null
      }
      placeholder={placeholder}
      zIndex={zIndex}
      variant="tinted"
      value={assetToSellValue}
      onDropdownOpen={onDropdownOpen}
      setOnSelectAsset={setOnSelectAsset}
      selectAsset={selectAsset}
      assetFilter={assetFilter}
      setAssetFilter={setAssetFilter}
      setValue={setAssetToSellInputValue}
    />
  );
};
