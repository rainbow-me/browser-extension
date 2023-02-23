import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Address } from 'wagmi';

import { ParsedAddressAsset } from '~/core/types/assets';
import { Box } from '~/design-system';

import { CoinIcon } from '../../../components/CoinIcon/CoinIcon';
import { DropdownInputWrapper } from '../../../components/DropdownInputWrapper/DropdownInputWrapper';
import { SortMethod } from '../../../hooks/send/useSendTransactionAsset';
import { SwapInputActionButton } from '../SwapInputActionButton';

import { TokenToReceiveInput } from './TokenToReceiveInput';
import { TokenToSwapDropdown } from './TokenToSwapDropdown';
import {
  TokenToSwapBottomComponent,
  TokenToSwapInput,
} from './TokenToSwapInput';

export const SwapTokenInput = ({
  asset,
  assets,
  selectAssetAddress,
  dropdownClosed = false,
  setSortMethod,
  sortMethod,
  zIndex,
  placeholder,
  onDropdownOpen,
  dropdownHeight,
  type,
}: {
  asset: ParsedAddressAsset | null;
  assets: ParsedAddressAsset[];
  selectAssetAddress: (address: Address | '') => void;
  dropdownClosed: boolean;
  setSortMethod: (sortMethod: SortMethod) => void;
  sortMethod: SortMethod;
  zIndex?: number;
  placeholder: string;
  onDropdownOpen: (open: boolean) => void;
  dropdownHeight?: number;
  type: 'toSwap' | 'toReceive';
}) => {
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
        type === 'toSwap' ? (
          <TokenToSwapInput
            innerRef={innerRef}
            asset={asset}
            placeholder={placeholder}
          />
        ) : (
          <TokenToReceiveInput asset={asset} placeholder={placeholder} />
        )
      }
      bottomComponent={
        type === 'toSwap' && !!asset ? (
          <TokenToSwapBottomComponent asset={asset} />
        ) : undefined
      }
      rightComponent={
        <SwapInputActionButton
          showClose={!!asset}
          onClose={() => onSelectAsset('')}
          dropdownVisible={dropdownVisible}
          testId={`input-wrapper-close-${'token-input'}`}
          asset={asset}
        />
      }
      dropdownComponent={
        <TokenToSwapDropdown
          asset={asset}
          assets={assets}
          sortMethod={sortMethod}
          setSortMethod={setSortMethod}
          onSelectAsset={onSelectAsset}
        />
      }
      dropdownVisible={dropdownVisible}
      onDropdownAction={onDropdownAction}
      borderVisible
    />
  );
};
