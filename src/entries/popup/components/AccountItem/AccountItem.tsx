import React from 'react';
import { Address, useBalance } from 'wagmi';

import { truncateAddress } from '~/core/utils/address';
import { handleSignificantDecimals } from '~/core/utils/numbers';
import { Box, Symbol } from '~/design-system';

import { useWalletName } from '../../hooks/useWalletName';
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
  searchTerm,
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

  let labelComponent = null;
  if (labelType === LabelOption.address) {
    labelComponent = showAddress ? (
      <MenuItem.Label text={truncateAddress(account)} />
    ) : null;
  } else if (labelType === LabelOption.balance) {
    labelComponent = (
      <MenuItem.Label
        text={`Ξ${handleSignificantDecimals(balance?.formatted || 0, 4)}`}
      />
    );
  }

  if (
    searchTerm &&
    !displayName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !account?.toLowerCase().includes(searchTerm.toLowerCase())
  )
    return null;

  return (
    <MenuItem
      onClick={onClick}
      key={account}
      titleComponent={<MenuItem.Title text={displayName || ''} />}
      labelComponent={labelComponent}
      leftComponent={
        <Box marginRight="-8px" height="fit" position="relative">
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
      }
      rightComponent={rightComponent}
    />
  );
}
