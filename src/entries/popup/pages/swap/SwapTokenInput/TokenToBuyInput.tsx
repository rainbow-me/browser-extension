import React, { useCallback, useRef } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';
import { AssetToBuySection } from '~/entries/popup/hooks/useSearchCurrencyLists';

import { TokenToBuyDropdown } from './TokenDropdown/TokenToBuyDropdown';
import { TokenToBuyInfo } from './TokenInfo/TokenToBuyInfo';
import { TokenInput } from './TokenInput';

interface TokenToBuyProps {
  asset: ParsedSearchAsset | null;
  assets?: AssetToBuySection[];
  assetFilter: string;
  dropdownClosed: boolean;
  dropdownHeight?: number;
  outputChainId: ChainId;
  placeholder: string;
  zIndex?: number;
  assetToBuyValue: string;
  inputRef: React.RefObject<HTMLInputElement>;
  inputDisabled?: boolean;
  openDropdownOnMount?: boolean;
  onDropdownOpen: (open: boolean) => void;
  setOutputChainId: (chainId: ChainId) => void;
  selectAsset: (asset: ParsedSearchAsset | null) => void;
  setAssetFilter: React.Dispatch<React.SetStateAction<string>>;
  setAssetToBuyInputValue: (value: string) => void;
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
  inputDisabled,
  openDropdownOnMount,
  onDropdownOpen,
  selectAsset,
  setAssetFilter,
  setOutputChainId,
  setAssetToBuyInputValue,
}: TokenToBuyProps) => {
  const onSelectAssetRef =
    useRef<(address: ParsedSearchAsset | null) => void>();
  const dropdownRef = useRef<{ openDropdown: () => void }>(null);

  const setOnSelectAsset = useCallback(
    (cb: (asset: ParsedSearchAsset | null) => void) => {
      onSelectAssetRef.current = (asset: ParsedSearchAsset | null) => {
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

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === shortcuts.send.FOCUS_ASSET.key) {
          dropdownRef?.current?.openDropdown();
        }
      }
    },
  });

  return (
    <TokenInput
      testId={`${asset ? `${asset.uniqueId}-` : ''}token-to-buy`}
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
      setValue={setAssetToBuyInputValue}
      openDropdownOnMount={openDropdownOnMount}
      inputDisabled={inputDisabled}
      ref={dropdownRef}
    />
  );
};
