import React from 'react';
import { Address } from 'wagmi';

import { truncateAddress } from '~/core/utils/address';
import { Box, Symbol } from '~/design-system';

import { useAvatar } from '../../hooks/useAvatar';
import { useEns } from '../../hooks/useEns';
import { Avatar } from '../Avatar/Avatar';
import { MenuItem } from '../Menu/MenuItem';

export default function AccountItem({
  account,
  rightComponent,
  onClick,
  labelComponent,
  isSelected,
}: {
  account: Address;
  rightComponent?: React.ReactNode;
  onClick?: () => void;
  labelComponent?: React.ReactNode;
  isSelected?: boolean;
}) {
  const { avatar, isFetched } = useAvatar({ address: account });
  const { ensName } = useEns({
    addressOrName: account,
  });
  return (
    <MenuItem
      onClick={onClick}
      key={account}
      titleComponent={
        <MenuItem.Title text={ensName || truncateAddress(account)} />
      }
      labelComponent={
        labelComponent ||
        (ensName ? <MenuItem.Label text={truncateAddress(account)} /> : null)
      }
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
                  <Avatar.Emoji color={avatar?.color} />
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
