import React, { useCallback, useRef } from 'react';

import { ParsedSearchAsset } from '~/core/types/assets';
import { SortMethod } from '~/entries/popup/hooks/send/useSendAsset';

import { TokenToSellDropdown } from './TokenDropdown/TokenToSellDropdown';
import { TokenToSellInfo } from './TokenInfo/TokenToSellInfo';
import { TokenInput } from './TokenInput';

interface SwapTokenInputProps {
  assetToSellMaxValue: { display: string; amount: string };
  assetToSellValue: string;
  asset: ParsedSearchAsset | null;
  assetFilter: string;
  assets?: ParsedSearchAsset[];
  dropdownClosed: boolean;
  dropdownHeight?: number;
  placeholder: string;
  sortMethod: SortMethod;
  zIndex?: number;
  inputRef: React.RefObject<HTMLInputElement>;
  openDropdownOnMount?: boolean;
  onDropdownOpen: (open: boolean) => void;
  setSortMethod: (sortMethod: SortMethod) => void;
  selectAsset: (asset: ParsedSearchAsset | null) => void;
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
  openDropdownOnMount,
  onDropdownOpen,
  selectAsset,
  setAssetFilter,
  setSortMethod,
  setAssetToSellMaxValue,
  setAssetToSellInputValue,
}: SwapTokenInputProps) => {
  const onSelectAssetRef = useRef<(asset: ParsedSearchAsset) => void>();

  const setOnSelectAsset = useCallback(
    (cb: (asset: ParsedSearchAsset) => void) => {
      onSelectAssetRef.current = (asset: ParsedSearchAsset) => {
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

  return (
    <TokenInput
      testId={`${asset ? `${asset.uniqueId}-` : ''}token-to-sell`}
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
            setAssetToSellMaxValue={setAssetToSellMaxValue}
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
      openDropdownOnMount={openDropdownOnMount}
    />
  );
};
