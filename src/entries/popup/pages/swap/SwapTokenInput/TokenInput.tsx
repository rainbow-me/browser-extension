import React, {
  ChangeEvent,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Address } from 'wagmi';

import { ParsedAddressAsset } from '~/core/types/assets';
import { Box } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { SwapInputMask } from '~/entries/popup/components/InputMask/SwapInputMask/SwapInputMask';

import { CoinIcon } from '../../../components/CoinIcon/CoinIcon';
import { DropdownInputWrapper } from '../../../components/DropdownInputWrapper/DropdownInputWrapper';
import { SwapInputActionButton } from '../SwapInputActionButton';

interface TokenInputProps {
  asset?: ParsedAddressAsset;
  assetFilter: string;
  dropdownHeight?: number;
  dropdownComponent: ReactElement;
  bottomComponent: ReactElement | null;
  placeholder: string;
  zIndex?: number;
  dropdownClosed: boolean;
  onDropdownOpen: (open: boolean) => void;
  setOnSelectAsset: (cb: (address: Address | '') => void) => void;
  selectAssetAddress: (address: Address | '') => void;
  setAssetFilter: React.Dispatch<React.SetStateAction<string>>;
}

export const TokenInput = ({
  asset,
  assetFilter,
  dropdownHeight,
  dropdownComponent,
  bottomComponent,
  placeholder,
  zIndex,
  dropdownClosed,
  onDropdownOpen,
  selectAssetAddress,
  setOnSelectAsset,
  setAssetFilter,
}: TokenInputProps) => {
  const [value, setValue] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDropdownAction = useCallback(() => {
    onDropdownOpen(!dropdownVisible);
    setDropdownVisible(!dropdownVisible);
    dropdownVisible ? inputRef?.current?.blur() : inputRef?.current?.focus();
  }, [dropdownVisible, onDropdownOpen]);

  const onSelectAsset = useCallback(() => {
    onDropdownOpen(false);
    setDropdownVisible(false);
    setTimeout(() => inputRef?.current?.focus(), 300);
  }, [onDropdownOpen]);

  const onClose = useCallback(() => {
    selectAssetAddress('');
  }, [selectAssetAddress]);

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
    setOnSelectAsset(onSelectAsset);
  }, [onSelectAsset, setOnSelectAsset]);

  return (
    <DropdownInputWrapper
      zIndex={zIndex || 1}
      dropdownHeight={dropdownHeight || 376}
      testId={'token-input'}
      leftComponent={
        <Box>
          <CoinIcon asset={asset ?? undefined} />
        </Box>
      }
      centerComponent={
        !asset ? (
          <Box>
            <Input
              testId="swap-token-input"
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
          <Box width="fit" marginVertical="-20px">
            <SwapInputMask
              borderColor="transparent"
              decimals={asset?.decimals}
              height="56px"
              placeholder="0.00"
              value={value}
              variant="tinted"
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
          testId={`input-wrapper-close-token-input`}
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
