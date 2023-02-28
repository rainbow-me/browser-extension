import React, { useCallback, useRef } from 'react';
import { Address } from 'wagmi';

import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';

import { TokenToReceiveDropdown } from './TokenDropdown/TokenToReceiveDropdown';
import { TokenToReceiveInfo } from './TokenInfo/TokenToReceiveInfo';
import { TokenInput } from './TokenInput';

interface TokenToReceiveProps {
  asset?: ParsedAddressAsset;
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
  onDropdownOpen: (open: boolean) => void;
  selectAssetAddress: (address: Address | '') => void;
  setOutputChainId: (chainId: ChainId) => void;
  setAssetFilter: React.Dispatch<React.SetStateAction<string>>;
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
  onDropdownOpen,
  selectAssetAddress,
  setAssetFilter,
  setOutputChainId,
}: TokenToReceiveProps) => {
  const onSelectAssetRef = useRef<(address: Address | '') => void>();

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
      accentCaretColor
      asset={asset}
      dropdownClosed={dropdownClosed}
      dropdownHeight={dropdownHeight}
      dropdownComponent={
        <TokenToReceiveDropdown
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
      onDropdownOpen={onDropdownOpen}
      setOnSelectAsset={setOnSelectAsset}
      selectAssetAddress={selectAssetAddress}
      assetFilter={assetFilter}
      setAssetFilter={setAssetFilter}
    />
  );
};
