import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Address } from 'wagmi';

import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';

import { TokenToReceiveDropdown } from './TokenDropdown/TokenToReceiveDropdown';
import { TokenToReceiveInfo } from './TokenInfo/TokenToReceiveInfo';
import { TokenInput } from './TokenInput';

interface TokenToReceiveProps {
  asset: ParsedAddressAsset | null;
  assets?: ParsedAddressAsset[];
  dropdownClosed: boolean;
  dropdownHeight?: number;
  outputChainId: ChainId;
  placeholder: string;
  zIndex?: number;
  onDropdownOpen: (open: boolean) => void;
  selectAssetAddress: (address: Address | '') => void;
  setOutputChainId: (chainId: ChainId) => void;
}

export const TokenToReceiveInput = ({
  asset,
  assets,
  dropdownClosed = false,
  dropdownHeight,
  outputChainId,
  placeholder,
  zIndex,
  onDropdownOpen,
  selectAssetAddress,
  setOutputChainId,
}: TokenToReceiveProps) => {
  const onSelectAssetRef = useRef<(address: Address | '') => void>();
  const [inputValue, setInputValue] = useState('');

  const setOnSelectAsset = useCallback(
    (cb: (address: Address | '') => void) => {
      onSelectAssetRef.current = (address: Address | '') => {
        cb(address);
        selectAssetAddress(address);
      };
    },
    [selectAssetAddress],
  );

  const filteredAssets = useMemo(() => {
    return inputValue
      ? assets?.filter(
          ({ name, symbol, address }) =>
            name.toLowerCase().startsWith(inputValue.toLowerCase()) ||
            symbol.toLowerCase().startsWith(inputValue.toLowerCase()) ||
            address.toLowerCase().startsWith(inputValue.toLowerCase()),
        )
      : assets;
  }, [assets, inputValue]);

  return (
    <TokenInput
      asset={asset}
      dropdownClosed={dropdownClosed}
      dropdownHeight={dropdownHeight}
      dropdownComponent={
        <TokenToReceiveDropdown
          asset={asset}
          assets={filteredAssets}
          onSelectAsset={onSelectAssetRef?.current}
          outputChainId={outputChainId}
          setOutputChainId={setOutputChainId}
        />
      }
      bottomComponent={asset ? <TokenToReceiveInfo asset={asset} /> : null}
      placeholder={placeholder}
      zIndex={zIndex}
      onDropdownOpen={onDropdownOpen}
      setOnSelectAsset={setOnSelectAsset}
      selectAssetAddress={selectAssetAddress}
      inputValue={inputValue}
      setInputValue={setInputValue}
    />
  );
};
