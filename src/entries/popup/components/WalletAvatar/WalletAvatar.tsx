import { Box } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';
import { BackgroundColor } from '~/design-system/styles/designTokens';

import { Avatar } from '../../components/Avatar/Avatar';
import { useAvatar } from '../../hooks/useAvatar';

export function WalletAvatar({
  address,
  size,
  emojiSize,
  mask,
  background,
}: {
  address: string;
  size: number;
  emojiSize?: TextStyles['fontSize'];
  mask?: string;
  background?: BackgroundColor;
}) {
  const { avatar, isFetched } = useAvatar({ address });
  return (
    <Box
      borderRadius="round"
      position="relative"
      background={background ?? 'fillSecondary'}
      style={{
        height: size,
        width: size,
        overflow: 'hidden',
      }}
    >
      {isFetched ? (
        <>
          {avatar?.imageUrl ? (
            <Avatar.Image mask={mask} size={size} imageUrl={avatar.imageUrl} />
          ) : (
            <Avatar.Emoji
              color={avatar?.color}
              emoji={avatar?.emoji}
              size={emojiSize}
              mask={mask}
            />
          )}
        </>
      ) : null}
      <Avatar.Skeleton />
    </Box>
  );
}
