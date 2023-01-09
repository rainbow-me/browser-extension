import React from 'react';
import { Address } from 'wagmi';

import { truncateAddress } from '~/core/utils/address';
import { Box, Inline, Text } from '~/design-system';

import { useAvatar } from '../../hooks/useAvatar';
import { useEns } from '../../hooks/useEns';
import { Avatar } from '../Avatar/Avatar';

export default function AddressPill({
  address,
  name,
}: {
  address: Address;
  name?: string;
}) {
  const { avatar, isFetched } = useAvatar({ address });
  const { ensName } = useEns({
    addressOrName: address,
  });
  return (
    <Box
      key={address}
      paddingLeft="4px"
      paddingRight="8px"
      paddingVertical="4px"
      background="fillSecondary"
      borderRadius="round"
    >
      <Inline space="4px" alignVertical="center">
        <Avatar.Wrapper size={12}>
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
        <Text weight="medium" color="labelTertiary" size="14pt">
          {name || ensName || truncateAddress(address)}
        </Text>
      </Inline>
    </Box>
  );
}
