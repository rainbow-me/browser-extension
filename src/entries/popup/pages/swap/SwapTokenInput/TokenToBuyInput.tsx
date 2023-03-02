import React, { useCallback, useRef } from 'react';

import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';

import { TokenToBuyDropdown } from './TokenDropdown/TokenToBuyDropdown';
import { TokenToBuyInfo } from './TokenInfo/TokenToBuyInfo';
import { TokenInput } from './TokenInput';

interface TokenToBuyProps {
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
  assetToBuyValue: string;
  inputRef: React.RefObject<HTMLInputElement>;
  onDropdownOpen: (open: boolean) => void;
  setOutputChainId: (chainId: ChainId) => void;
  selectAsset: (asset: ParsedAddressAsset | null) => void;
  setAssetFilter: React.Dispatch<React.SetStateAction<string>>;
  setAssetToBuyValue: (value: string) => void;
}

export const TokenToBuyInput = ({
  asset,
  assetFilter,
  assets,
  dropdownClosed = false,
  dropdownHeight,
  outputChainId,
  placeholder,
  zIndex,
  assetToBuyValue,
  inputRef,
  onDropdownOpen,
  selectAsset,
  setAssetFilter,
  setOutputChainId,
  setAssetToBuyValue,
}: TokenToBuyProps) => {
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
        <TokenToBuyDropdown
          onDropdownChange={onDropdownChange}
          asset={asset}
          assets={assets}
          onSelectAsset={onSelectAssetRef?.current}
          outputChainId={outputChainId}
          setOutputChainId={setOutputChainId}
        />
      }
      bottomComponent={asset ? <TokenToBuyInfo asset={asset} /> : null}
      placeholder={placeholder}
      zIndex={zIndex}
      variant="tinted"
      value={assetToBuyValue}
      onDropdownOpen={onDropdownOpen}
      setOnSelectAsset={setOnSelectAsset}
      selectAsset={selectAsset}
      assetFilter={assetFilter}
      setAssetFilter={setAssetFilter}
      setValue={setAssetToBuyValue}
    />
  );
};
