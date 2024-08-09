import React, { useCallback, useRef } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { ParsedSearchAsset } from '~/core/types/assets';
import { SortMethod } from '~/entries/popup/hooks/send/useSendAsset';
import { IndependentField } from '~/entries/popup/hooks/swap/useSwapInputs';
import useKeyboardAnalytics from '~/entries/popup/hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';

import { TokenToSellDropdown } from './TokenDropdown/TokenToSellDropdown';
import { TokenToSellInfo } from './TokenInfo/TokenToSellInfo';
import { TokenInput } from './TokenInput';

interface SwapTokenInputProps {
  assetToSellMaxValue: { display: string; amount: string };
  assetToSellValue: string;
  asset: ParsedSearchAsset | null;
  assetToSellFullValue: string;
  assetFilter: string;
  assets?: ParsedSearchAsset[];
  dropdownClosed: boolean;
  dropdownHeight?: number;
  placeholder: string;
  sortMethod: SortMethod;
  zIndex?: number;
  inputRef: React.RefObject<HTMLInputElement>;
  independentField: IndependentField;
  openDropdownOnMount?: boolean;
  assetToSellNativeDisplay: { amount: string; display: string } | null;
  assetToSellNativeValue: string;
  onDropdownOpen: (open: boolean) => void;
  setSortMethod: (sortMethod: SortMethod) => void;
  selectAsset: (asset: ParsedSearchAsset | null) => void;
  setAssetFilter: React.Dispatch<React.SetStateAction<string>>;
  setAssetToSellMaxValue: () => void;
  setAssetToSellInputValue: (value: string) => void;
  setAssetToSellInputNativeValue: (value: string) => void;
  setIndependentField: (field: IndependentField) => void;
}

export const TokenToSellInput = ({
  assetToSellMaxValue,
  asset,
  assetToSellFullValue,
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
  independentField,
  assetToSellNativeDisplay,
  assetToSellNativeValue,
  onDropdownOpen,
  selectAsset,
  setAssetFilter,
  setSortMethod,
  setAssetToSellMaxValue,
  setAssetToSellInputValue,
  setAssetToSellInputNativeValue,
  setIndependentField,
}: SwapTokenInputProps) => {
  const onSelectAssetRef = useRef<(asset: ParsedSearchAsset) => void>();
  const dropdownRef = useRef<{ openDropdown: () => void }>(null);
  const { trackShortcut } = useKeyboardAnalytics();

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

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === shortcuts.swap.FOCUS_ASSET_TO_SELL.key) {
          trackShortcut({
            key: shortcuts.swap.FOCUS_ASSET_TO_SELL.display,
            type: 'swap.focusAssetToSell',
          });
          dropdownRef?.current?.openDropdown();
        }
      }
    },
  });

  return (
    <TokenInput
      testId={`${asset ? `${asset.uniqueId}-` : ''}token-to-sell`}
      inputRef={inputRef}
      accentCaretColor
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
            assetToSellNativeDisplay={assetToSellNativeDisplay}
            assetToSellNativeValue={assetToSellNativeValue}
            assetToSellMaxValue={assetToSellMaxValue}
            asset={asset}
            setAssetToSellMaxValue={setAssetToSellMaxValue}
            setAssetToSellInputNativeValue={setAssetToSellInputNativeValue}
            independentField={independentField}
            setIndependentField={setIndependentField}
          />
        ) : null
      }
      placeholder={placeholder}
      zIndex={zIndex}
      variant="tinted"
      showAssetTooltipOnBlur={true}
      assetTooltipValue={assetToSellFullValue}
      value={assetToSellValue}
      onDropdownOpen={onDropdownOpen}
      setOnSelectAsset={setOnSelectAsset}
      selectAsset={selectAsset}
      assetFilter={assetFilter}
      setAssetFilter={setAssetFilter}
      setValue={setAssetToSellInputValue}
      openDropdownOnMount={openDropdownOnMount}
      ref={dropdownRef}
      onFocus={() => setIndependentField('sellField')}
    />
  );
};
