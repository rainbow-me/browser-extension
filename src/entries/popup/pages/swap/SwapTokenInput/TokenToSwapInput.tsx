import React, { useCallback, useRef } from 'react';
import { Address } from 'wagmi';

import { ParsedAddressAsset } from '~/core/types/assets';

import { SortMethod } from '../../../hooks/send/useSendTransactionAsset';

import { TokenToSwapDropdown } from './TokenDropdown/TokenToSwapDropdown';
import { TokenToSwapInfo } from './TokenInfo/TokenToSwapInfo';
import { TokenInput } from './TokenInput';

interface SwapTokenInputProps {
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
}

export const TokenToSwapInput = ({
  asset,
  assetFilter,
  assets,
  dropdownClosed = false,
  dropdownHeight,
  placeholder,
  sortMethod,
  zIndex,
  onDropdownOpen,
  selectAssetAddress,
  setAssetFilter,
  setSortMethod,
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

  return (
    <TokenInput
      inputRef={inputRef}
      asset={asset}
      dropdownClosed={dropdownClosed}
      dropdownHeight={dropdownHeight}
      dropdownComponent={
        <TokenToSwapDropdown
          asset={asset}
          assets={assets}
          sortMethod={sortMethod}
          onSelectAsset={onSelectAssetRef?.current}
          setSortMethod={setSortMethod}
        />
      }
      bottomComponent={asset ? <TokenToSwapInfo asset={asset} /> : null}
      placeholder={placeholder}
      zIndex={zIndex}
      variant="transparent"
      onDropdownOpen={onDropdownOpen}
      setOnSelectAsset={setOnSelectAsset}
      selectAssetAddress={selectAssetAddress}
      assetFilter={assetFilter}
      setAssetFilter={setAssetFilter}
    />
  );
};
