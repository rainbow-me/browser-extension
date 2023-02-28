import React, { useCallback, useRef } from 'react';
import { Address } from 'wagmi';

import { ParsedAddressAsset } from '~/core/types/assets';

import { SortMethod } from '../../../hooks/send/useSendTransactionAsset';

import { TokenToSwapDropdown } from './TokenDropdown/TokenToSwapDropdown';
import { TokenToSwapInfo } from './TokenInfo/TokenToSwapInfo';
import { TokenInput } from './TokenInput';

interface SwapTokenInputProps {
  assetToSwapMaxValue: { display: string; amount: string };
  assetToSwapValue: string;
  asset?: ParsedAddressAsset;
  assetFilter: string;
  assets?: ParsedAddressAsset[];
  dropdownClosed: boolean;
  dropdownHeight?: number;
  placeholder: string;
  sortMethod: SortMethod;
  zIndex?: number;
  onDropdownOpen: (open: boolean) => void;
  selectAssetAddress: (address: Address | '') => void;
  setSortMethod: (sortMethod: SortMethod) => void;
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
  onDropdownOpen,
  selectAssetAddress,
  setAssetFilter,
  setSortMethod,
  setAssetToSwapMaxValue,
  setAssetToSwapValue,
}: SwapTokenInputProps) => {
  const onSelectAssetRef = useRef<(address: Address | '') => void>();
  const inputRef = useRef<HTMLInputElement>(null);

  const setOnSelectAsset = useCallback(
    (cb: (address: Address | '') => void) => {
      onSelectAssetRef.current = (address: Address | '') => {
        cb(address);
        selectAssetAddress(address);
      };
    },
    [selectAssetAddress],
  );

  const onDropdownChange = useCallback((open: boolean) => {
    if (!open) {
      setTimeout(() => inputRef?.current?.focus(), 300);
    }
  }, []);

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
            assetToSwapMaxValue={assetToSwapMaxValue}
            asset={asset}
            setAssetToSwapMaxValue={setAssetToSwapMaxValue}
          />
        ) : null
      }
      placeholder={placeholder}
      zIndex={zIndex}
      variant="transparent"
      value={assetToSwapValue}
      onDropdownOpen={onDropdownOpen}
      setOnSelectAsset={setOnSelectAsset}
      selectAssetAddress={selectAssetAddress}
      assetFilter={assetFilter}
      setAssetFilter={setAssetFilter}
      setValue={setAssetToSwapValue}
    />
  );
};
