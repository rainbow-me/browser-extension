import React, { useCallback, useRef } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { IndependentField } from '~/entries/popup/hooks/swap/useSwapInputs';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';
import { AssetToBuySection } from '~/entries/popup/hooks/useSearchCurrencyLists';

import { TokenToBuyDropdown } from './TokenDropdown/TokenToBuyDropdown';
import { TokenToBuyInfo } from './TokenInfo/TokenToBuyInfo';
import { TokenInput } from './TokenInput';

interface TokenToBuyProps {
  assetToBuy: ParsedSearchAsset | null;
  assetToSell: ParsedSearchAsset | null;
  assets?: AssetToBuySection[];
  assetFilter: string;
  dropdownClosed: boolean;
  dropdownHeight?: number;
  outputChainId: ChainId;
  placeholder: string;
  zIndex?: number;
  assetToBuyValue: string;
  assetToSellValue: string;
  inputRef: React.RefObject<HTMLInputElement>;
  inputDisabled?: boolean;
  openDropdownOnMount?: boolean;
  assetToBuyNativeDisplay: { amount: string; display: string } | null;
  assetToSellNativeDisplay: { amount: string; display: string } | null;
  onDropdownOpen: (open: boolean) => void;
  setOutputChainId: (chainId: ChainId) => void;
  selectAsset: (asset: ParsedSearchAsset | null) => void;
  setAssetFilter: React.Dispatch<React.SetStateAction<string>>;
  setAssetToBuyInputValue: (value: string) => void;
  setIndependentField: React.Dispatch<React.SetStateAction<IndependentField>>;
}

export const TokenToBuyInput = ({
  assetToBuy,
  assetToSell,
  assetFilter,
  assets,
  assetToBuyNativeDisplay,
  assetToSellNativeDisplay,
  dropdownClosed = false,
  dropdownHeight,
  outputChainId,
  placeholder,
  zIndex,
  assetToBuyValue,
  assetToSellValue,
  inputRef,
  inputDisabled,
  openDropdownOnMount,
  onDropdownOpen,
  selectAsset,
  setAssetFilter,
  setOutputChainId,
  setAssetToBuyInputValue,
  setIndependentField,
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
        if (e.key === shortcuts.swap.FOCUS_ASSET_TO_BUY.key) {
          dropdownRef?.current?.openDropdown();
        }
      }
    },
  });

  return (
    <TokenInput
      testId={`${assetToBuy ? `${assetToBuy.uniqueId}-` : ''}token-to-buy`}
      inputRef={inputRef}
      accentCaretColor
      asset={assetToBuy}
      dropdownClosed={dropdownClosed}
      dropdownHeight={dropdownHeight}
      dropdownComponent={
        <TokenToBuyDropdown
          onDropdownChange={onDropdownChange}
          asset={assetToBuy}
          assets={assets}
          onSelectAsset={onSelectAssetRef?.current}
          outputChainId={outputChainId}
          setOutputChainId={setOutputChainId}
        />
      }
      bottomComponent={
        assetToBuy ? (
          <TokenToBuyInfo
            assetToBuyNativeDisplay={assetToBuyNativeDisplay}
            assetToSellNativeDisplay={assetToSellNativeDisplay}
            assetToBuy={assetToBuy}
            assetToSell={assetToSell}
            assetToBuyValue={assetToBuyValue}
            assetToSellValue={assetToSellValue}
          />
        ) : null
      }
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
      onFocus={() => setIndependentField('buyField')}
    />
  );
};
