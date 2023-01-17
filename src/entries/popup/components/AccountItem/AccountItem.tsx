import React from 'react';
import { Address, useBalance } from 'wagmi';

import { truncateAddress } from '~/core/utils/address';
import { handleSignificantDecimals } from '~/core/utils/numbers';
import { Box, Symbol } from '~/design-system';

import { useAvatar } from '../../hooks/useAvatar';
import { useWalletName } from '../../hooks/useWalletName';
import { Avatar } from '../Avatar/Avatar';
import { MenuItem } from '../Menu/MenuItem';

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
}) {
  const { avatar, isFetched } = useAvatar({ address: account });
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
              background="surfaceSecondary"
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
          <Avatar.Wrapper size={36}>
            {isFetched ? (
              <>
                {avatar?.imageUrl ? (
                  <Avatar.Image imageUrl={avatar.imageUrl} />
                ) : (
                  <Avatar.Emoji
                    color={avatar?.color}
                    emoji={avatar?.emoji}
                    size="20pt"
                  />
                )}
              </>
            ) : null}
            <Avatar.Skeleton />
          </Avatar.Wrapper>
        </Box>
      }
      rightComponent={rightComponent}
    />
  );
}
