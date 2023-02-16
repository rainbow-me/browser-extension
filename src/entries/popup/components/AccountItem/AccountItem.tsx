import React from 'react';
import { Address, useBalance } from 'wagmi';

import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { truncateAddress } from '~/core/utils/address';
import { handleSignificantDecimals } from '~/core/utils/numbers';
import { Box, Inline, Row, Rows, Symbol, Text } from '~/design-system';

import { Asterisks } from '../../components/Asterisks/Asterisks';
import { useWalletName } from '../../hooks/useWalletName';
import { rowHighlightWrapperStyle } from '../CoinRow/CoinRow.css';
import { MenuItem } from '../Menu/MenuItem';
import { WalletAvatar } from '../WalletAvatar/WalletAvatar';

export enum LabelOption {
  address = 'address',
  balance = 'balance',
}

export default function AccountItem({
  account,
  rightComponent,
  onClick,
  labelType,
  isSelected,
}: {
  account: Address;
  rightComponent?: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  labelType?: LabelOption;
  searchTerm?: string;
}) {
  const { displayName, showAddress } = useWalletName({ address: account });
  const { data: balance } = useBalance({ addressOrName: account });
  const { hideAssetBalances } = useHideAssetBalancesStore();

  let labelComponent = null;
  if (labelType === LabelOption.address) {
    labelComponent = showAddress ? (
      <MenuItem.Label text={truncateAddress(account)} />
    ) : null;
  } else if (labelType === LabelOption.balance) {
    labelComponent = hideAssetBalances ? (
      <Inline alignVertical="center">
        <Text color="labelTertiary" size="12pt" weight="medium">
          {'Ξ'}
        </Text>
        <Asterisks color="labelTertiary" size={10} />
      </Inline>
    ) : (
      <MenuItem.Label
        text={`Ξ${handleSignificantDecimals(balance?.formatted || 0, 4)}`}
      />
    );
  }

  return (
    <Box
      className={rowHighlightWrapperStyle}
      onClick={onClick}
      key={account}
      paddingHorizontal="12px"
      paddingVertical="8px"
    >
      <Inline alignHorizontal="justify" alignVertical="center">
        <Inline space="8px" alignHorizontal="left">
          <Box height="fit" position="relative">
            {isSelected && (
              <Box
                style={{
                  width: 20,
                  height: 20,
                  zIndex: 1,
                  bottom: -4,
                  left: -4,
                }}
                position="absolute"
                padding="3px"
                borderRadius="round"
                background="surfacePrimaryElevated"
                alignItems="center"
                justifyContent="center"
              >
                <Symbol
                  symbol="checkmark.circle.fill"
                  color="accent"
                  weight="bold"
                  size={14}
                />
              </Box>
            )}
            <WalletAvatar address={account} size={36} emojiSize="20pt" />
          </Box>
          <Box>
            <Rows space="8px" alignVertical="center">
              <Row height="content">
                <MenuItem.Title text={displayName || ''} />
              </Row>
              <Row height="content">{labelComponent}</Row>
            </Rows>
          </Box>
        </Inline>

        <Box>{rightComponent}</Box>
      </Inline>
    </Box>
  );
}
