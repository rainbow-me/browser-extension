import React from 'react';
import { Address } from 'wagmi';

import { truncateAddress } from '~/core/utils/address';
import { Box } from '~/design-system';

import { useAvatar } from '../../hooks/useAvatar';
import { useEns } from '../../hooks/useEns';
import { Avatar } from '../Avatar/Avatar';
import { MenuItem } from '../Menu/MenuItem';

export default function AccountItem({
  account,
  rightComponent,
}: {
  account: Address;
  rightComponent?: React.ReactNode;
}) {
  const { avatar, isFetched } = useAvatar({ address: account });
  const { ensName } = useEns({
    addressOrName: account,
  });
  return (
    <MenuItem
      key={account}
      titleComponent={
        <MenuItem.Title text={ensName || truncateAddress(account)} />
      }
      labelComponent={
        ensName ? <MenuItem.Label text={truncateAddress(account)} /> : null
      }
      leftComponent={
        <Box marginRight="-8px">
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
