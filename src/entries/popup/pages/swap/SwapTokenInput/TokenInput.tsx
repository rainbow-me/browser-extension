import React, {
  ChangeEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { ParsedSearchAsset } from '~/core/types/assets';
import { Box } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { SwapInputMask } from '~/entries/popup/components/InputMask/SwapInputMask/SwapInputMask';
import usePrevious from '~/entries/popup/hooks/usePrevious';

import { CoinIcon } from '../../../components/CoinIcon/CoinIcon';
import { DropdownInputWrapper } from '../../../components/DropdownInputWrapper/DropdownInputWrapper';
import { SwapInputActionButton } from '../SwapInputActionButton';

interface TokenInputProps {
  accentCaretColor?: boolean;
  asset: ParsedSearchAsset | null;
  assetFilter: string;
  dropdownHeight?: number;
  dropdownComponent: ReactElement;
  bottomComponent: ReactElement | null;
  placeholder: string;
  zIndex?: number;
  dropdownClosed: boolean;
  variant: 'surface' | 'bordered' | 'transparent' | 'tinted';
  inputRef: React.RefObject<HTMLInputElement>;
  value: string;
  testId: string;
  openDropdownOnMount?: boolean;
  onDropdownOpen: (open: boolean) => void;
  selectAsset: (asset: ParsedSearchAsset | null) => void;
  setOnSelectAsset: (cb: (asset: ParsedSearchAsset | null) => void) => void;
  setAssetFilter: React.Dispatch<React.SetStateAction<string>>;
  setValue: (value: string) => void;
}

export const TokenInput = ({
  accentCaretColor,
  asset,
  assetFilter,
  dropdownHeight,
  dropdownComponent,
  bottomComponent,
  placeholder,
  zIndex,
  dropdownClosed,
  variant,
  inputRef,
  value,
  testId,
  openDropdownOnMount,
  onDropdownOpen,
  selectAsset,
  setOnSelectAsset,
  setAssetFilter,
  setValue,
}: TokenInputProps) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const prevDropdownVisible = usePrevious(dropdownVisible);

  const onDropdownAction = useCallback(() => {
    onDropdownOpen(!dropdownVisible);
    setDropdownVisible(!dropdownVisible);
    dropdownVisible ? inputRef?.current?.blur() : inputRef?.current?.focus();
  }, [dropdownVisible, inputRef, onDropdownOpen]);

  const onSelectAsset = useCallback(() => {
    onDropdownOpen(false);
    setDropdownVisible(false);
    setTimeout(() => inputRef?.current?.focus(), 300);
  }, [inputRef, onDropdownOpen]);

  const onClose = useCallback(() => {
    selectAsset(null);
  }, [selectAsset]);

  const onInputValueChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAssetFilter(e.target.value);
    },
    [setAssetFilter],
  );

  useEffect(() => {
    if (dropdownClosed) {
      setDropdownVisible(false);
    }
  }, [dropdownClosed]);

  useEffect(() => {
    if (prevDropdownVisible !== dropdownVisible && dropdownVisible) {
      setTimeout(() => inputRef?.current?.focus(), 300);
    }
  });

  useEffect(() => {
    setOnSelectAsset(onSelectAsset);
  }, [onSelectAsset, setOnSelectAsset]);

  useEffect(() => {
    if (openDropdownOnMount) setTimeout(() => onDropdownAction(), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDropdownOnMount]);

  return (
    <DropdownInputWrapper
      zIndex={zIndex || 1}
      dropdownHeight={dropdownHeight || 376}
      testId={`${testId}-token-input`}
      leftComponent={
        <Box>
          <CoinIcon asset={asset ?? undefined} />
        </Box>
      }
      centerComponent={
        !asset ? (
          <Box>
            <Input
              testId={`${testId}-search-token-input`}
              value={assetFilter}
              placeholder={placeholder}
              onChange={onInputValueChange}
              height="32px"
              variant="transparent"
              style={{ paddingLeft: 0, paddingRight: 0 }}
              innerRef={inputRef}
            />
          </Box>
        ) : (
          <Box marginVertical="-20px">
            <SwapInputMask
              testId={`${testId}-swap-token-input`}
              accentCaretColor={accentCaretColor}
              borderColor="transparent"
              decimals={asset?.decimals}
              height="56px"
              placeholder="0.00"
              value={value}
              variant={variant}
              onChange={setValue}
              paddingHorizontal={0}
              innerRef={inputRef}
            />
          </Box>
        )
      }
      bottomComponent={bottomComponent}
      rightComponent={
        <SwapInputActionButton
          showClose={!!asset}
          onClose={onClose}
          dropdownVisible={dropdownVisible}
          testId={`${testId}-token-input-remove`}
          asset={asset}
        />
      }
      dropdownComponent={dropdownComponent}
      dropdownVisible={dropdownVisible}
      onDropdownAction={onDropdownAction}
      borderVisible
    />
  );
};
