import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Address } from 'wagmi';

import { ParsedAddressAsset, ParsedAsset } from '~/core/types/assets';
import { Box } from '~/design-system';

import { CoinIcon } from '../../../components/CoinIcon/CoinIcon';
import { DropdownInputWrapper } from '../../../components/DropdownInputWrapper/DropdownInputWrapper';
import { SortMethod } from '../../../hooks/send/useSendTransactionAsset';
import { SwapInputActionButton } from '../SwapInputActionButton';

import { TokenDropdown } from './TokenDropdown';
import { TokenInfo } from './TokenInfo';
import { TokenInput } from './TokenInput';

interface SwapTokenInputProps {
  asset: ParsedAddressAsset | null;
  assets?: ParsedAddressAsset[] | ParsedAsset[];
  dropdownClosed: boolean;
  dropdownHeight?: number;
  placeholder: string;
  sortMethod: SortMethod;
  type: 'toSwap' | 'toReceive';
  zIndex?: number;
  onDropdownOpen: (open: boolean) => void;
  selectAssetAddress: (address: Address | '') => void;
  setSortMethod: (sortMethod: SortMethod) => void;
}

export const SwapTokenInput = ({
  asset,
  assets,
  dropdownClosed = false,
  dropdownHeight,
  placeholder,
  sortMethod,
  type,
  zIndex,
  onDropdownOpen,
  selectAssetAddress,
  setSortMethod,
}: SwapTokenInputProps) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const innerRef = useRef<HTMLInputElement>(null);

  const onDropdownAction = useCallback(() => {
    onDropdownOpen(!dropdownVisible);
    setDropdownVisible(!dropdownVisible);
  }, [dropdownVisible, onDropdownOpen]);

  const onSelectAsset = useCallback(
    (address: Address | '') => {
      selectAssetAddress(address);
      onDropdownOpen(false);
      setDropdownVisible(false);
      setTimeout(() => innerRef?.current?.focus(), 300);
    },
    [onDropdownOpen, selectAssetAddress],
  );

  const dropdownComponent = useMemo(() => {
    switch (type) {
      case 'toSwap':
        return (
          <TokenDropdown
            type={type}
            asset={asset}
            assets={assets as ParsedAddressAsset[]}
            sortMethod={sortMethod}
            setSortMethod={setSortMethod}
            onSelectAsset={onSelectAsset}
          />
        );
      case 'toReceive':
        return (
          <TokenDropdown
            type={type}
            asset={asset}
            assets={assets as ParsedAsset[]}
            onSelectAsset={onSelectAsset}
          />
        );
    }
  }, [asset, assets, onSelectAsset, setSortMethod, sortMethod, type]);

  useEffect(() => {
    if (dropdownClosed) {
      setDropdownVisible(false);
    }
  }, [dropdownClosed]);

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
        <TokenInput
          innerRef={innerRef}
          asset={asset}
          placeholder={placeholder}
        />
      }
      bottomComponent={asset ? <TokenInfo type={type} asset={asset} /> : null}
      rightComponent={
        <SwapInputActionButton
          showClose={!!asset}
          onClose={() => onSelectAsset('')}
          dropdownVisible={dropdownVisible}
          testId={`input-wrapper-close-${'token-input'}`}
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
