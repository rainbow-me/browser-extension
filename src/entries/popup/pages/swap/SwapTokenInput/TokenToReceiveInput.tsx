import React, { useCallback, useRef } from 'react';
import { Address } from 'wagmi';

import { ParsedAddressAsset } from '~/core/types/assets';

import { TokenToReceiveDropdown } from './TokenDropdown/TokenToReceiveDropdown';
import { TokenToReceiveInfo } from './TokenInfo/TokenToReceiveInfo';
import { TokenInput } from './TokenInput';

interface TokenToReceiveProps {
  asset: ParsedAddressAsset | null;
  assets?: ParsedAddressAsset[];
  dropdownClosed: boolean;
  dropdownHeight?: number;
  placeholder: string;
  zIndex?: number;
  onDropdownOpen: (open: boolean) => void;
  selectAssetAddress: (address: Address | '') => void;
}

export const TokenToReceiveInput = ({
  asset,
  assets,
  dropdownClosed = false,
  dropdownHeight,
  placeholder,
  zIndex,
  onDropdownOpen,
  selectAssetAddress,
}: TokenToReceiveProps) => {
  const onSelectAssetRef = useRef<(address: Address | '') => void>();

  const setOnSelectAsset = useCallback(
    (cb: () => void) => {
      onSelectAssetRef.current = (address: Address | '') => {
        cb();
        selectAssetAddress(address);
      };
    },
    [selectAssetAddress],
  );

  return (
    <TokenInput
      asset={asset}
      dropdownClosed={dropdownClosed}
      dropdownHeight={dropdownHeight}
      dropdownComponent={
        <TokenToReceiveDropdown
          asset={asset}
          assets={assets}
          onSelectAsset={onSelectAssetRef?.current}
        />
      }
      bottomComponent={asset ? <TokenToReceiveInfo asset={asset} /> : null}
      placeholder={placeholder}
      zIndex={zIndex}
      onDropdownOpen={onDropdownOpen}
      setOnSelectAsset={setOnSelectAsset}
    />
  );
};
