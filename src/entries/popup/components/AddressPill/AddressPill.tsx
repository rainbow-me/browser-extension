import React from 'react';
import { type Address } from 'viem';

import { Box, Inline, TextOverflow } from '~/design-system';

import { useAvatar } from '../../hooks/useAvatar';
import { useWalletName } from '../../hooks/useWalletName';
import { Avatar } from '../Avatar/Avatar';

export default function AddressPill({ address }: { address: Address }) {
  const { data: avatar, isFetched } = useAvatar({ addressOrName: address });
  const { displayName } = useWalletName({ address });
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
        <Avatar.Wrapper size={12} color={avatar?.color}>
          {isFetched ? (
            <>
              {avatar?.imageUrl ? (
                <Avatar.Image size={12} imageUrl={avatar.imageUrl} />
              ) : (
                <Avatar.Emoji color={avatar?.color} />
              )}
            </>
          ) : null}
          <Avatar.Skeleton />
        </Avatar.Wrapper>
        <TextOverflow weight="medium" color="labelTertiary" size="14pt">
          {displayName}
        </TextOverflow>
      </Inline>
    </Box>
  );
}
