import React, { useCallback, useRef } from 'react';

import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';

import { TokenToReceiveDropdown } from './TokenDropdown/TokenToReceiveDropdown';
import { TokenToReceiveInfo } from './TokenInfo/TokenToReceiveInfo';
import { TokenInput } from './TokenInput';

interface TokenToReceiveProps {
  asset: ParsedAddressAsset | null;
  assets?: {
    data: ParsedAddressAsset[];
    title: string;
    id: string;
    symbol: SymbolProps['symbol'];
  }[];
  assetFilter: string;
  dropdownClosed: boolean;
  dropdownHeight?: number;
  outputChainId: ChainId;
  placeholder: string;
  zIndex?: number;
  assetToReceiveValue: string;
  inputRef: React.RefObject<HTMLInputElement>;
  onDropdownOpen: (open: boolean) => void;
  setOutputChainId: (chainId: ChainId) => void;
  selectAsset: (asset: ParsedAddressAsset | null) => void;
  setAssetFilter: React.Dispatch<React.SetStateAction<string>>;
  setAssetToReceiveValue: (value: string) => void;
}

export const TokenToReceiveInput = ({
  asset,
  assetFilter,
  assets,
  dropdownClosed = false,
  dropdownHeight,
  outputChainId,
  placeholder,
  zIndex,
  assetToReceiveValue,
  inputRef,
  onDropdownOpen,
  selectAsset,
  setAssetFilter,
  setOutputChainId,
  setAssetToReceiveValue,
}: TokenToReceiveProps) => {
  const onSelectAssetRef =
    useRef<(address: ParsedAddressAsset | null) => void>();

  const setOnSelectAsset = useCallback(
    (cb: (asset: ParsedAddressAsset | null) => void) => {
      onSelectAssetRef.current = (asset: ParsedAddressAsset | null) => {
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
      inputRef={inputRef}
      accentCaretColor
      asset={asset}
      dropdownClosed={dropdownClosed}
      dropdownHeight={dropdownHeight}
      dropdownComponent={
        <TokenToReceiveDropdown
          onDropdownChange={onDropdownChange}
          asset={asset}
          assets={assets}
          onSelectAsset={onSelectAssetRef?.current}
          outputChainId={outputChainId}
          setOutputChainId={setOutputChainId}
        />
      }
      bottomComponent={asset ? <TokenToReceiveInfo asset={asset} /> : null}
      placeholder={placeholder}
      zIndex={zIndex}
      variant="tinted"
      value={assetToReceiveValue}
      onDropdownOpen={onDropdownOpen}
      setOnSelectAsset={setOnSelectAsset}
      selectAsset={selectAsset}
      assetFilter={assetFilter}
      setAssetFilter={setAssetFilter}
      setValue={setAssetToReceiveValue}
    />
  );
};
