import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Address } from 'wagmi';

import { ParsedAddressAsset } from '~/core/types/assets';
import { Box, Text } from '~/design-system';
import { SwapInputMask } from '~/entries/popup/components/InputMask/SwapInputMask/SwapInputMask';

import { CoinIcon } from '../../../components/CoinIcon/CoinIcon';
import { DropdownInputWrapper } from '../../../components/DropdownInputWrapper/DropdownInputWrapper';
import { SwapInputActionButton } from '../SwapInputActionButton';

interface TokenInputProps {
  asset: ParsedAddressAsset | null;
  dropdownHeight?: number;
  dropdownComponent: ReactElement;
  bottomComponent: ReactElement | null;
  placeholder: string;
  zIndex?: number;
  dropdownClosed: boolean;
  onDropdownOpen: (open: boolean) => void;
  setOnSelectAsset: (cb: (address: Address | '') => void) => void;
  selectAssetAddress: (address: Address | '') => void;
}

export const TokenInput = ({
  asset,
  dropdownHeight,
  dropdownComponent,
  bottomComponent,
  placeholder,
  zIndex,
  dropdownClosed,
  onDropdownOpen,
  selectAssetAddress,
  setOnSelectAsset,
}: TokenInputProps) => {
  const [value, setValue] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const innerRef = useRef<HTMLInputElement>(null);

  const onDropdownAction = useCallback(() => {
    onDropdownOpen(!dropdownVisible);
    setDropdownVisible(!dropdownVisible);
  }, [dropdownVisible, onDropdownOpen]);

  const onSelectAsset = useCallback(() => {
    onDropdownOpen(false);
    setDropdownVisible(false);
    setTimeout(() => innerRef?.current?.focus(), 300);
  }, [onDropdownOpen]);

  const onClose = useCallback(() => {
    selectAssetAddress('');
  }, [selectAssetAddress]);

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
          <Box width="fit">
            <Text
              size="16pt"
              weight="semibold"
              color={`${asset ? 'label' : 'labelTertiary'}`}
            >
              {placeholder}
            </Text>
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
              innerRef={innerRef}
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
