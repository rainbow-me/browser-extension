import * as React from 'react';
import { Address } from 'wagmi';

import { Box } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';

import { Avatar } from '../../components/Avatar/Avatar';
import { useAvatar } from '../../hooks/useAvatar';

export function WalletAvatar({
  address,
  size,
  emojiSize,
}: {
  address: Address;
  size: number;
  emojiSize?: TextStyles['fontSize'];
}) {
  const { avatar, isFetched } = useAvatar({ address });
  return (
    <Box
      borderRadius="round"
      position="relative"
      background="fillSecondary"
      style={{
        height: size,
        width: size,
        overflow: 'hidden',
      }}
    >
      {isFetched ? (
        <>
          {avatar?.imageUrl ? (
            <Avatar.Image size={size} imageUrl={avatar.imageUrl} />
          ) : (
            <Avatar.Emoji
              color={avatar?.color}
              emoji={avatar?.emoji}
              size={emojiSize}
            />
          )}
        </>
      ) : null}
      <Avatar.Skeleton />
    </Box>
  );
}
