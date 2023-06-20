import { Box } from '~/design-system';
import { BoxStyles, TextStyles } from '~/design-system/styles/core.css';
import { BackgroundColor } from '~/design-system/styles/designTokens';

import { Avatar } from '../../components/Avatar/Avatar';
import { useAvatar } from '../../hooks/useAvatar';

export function WalletAvatar({
  address,
  size,
  emojiSize,
  mask,
  background,
  emojiPaddingLeft,
  emojiPaddingTop,
}: {
  address: string;
  size: number;
  emojiSize?: TextStyles['fontSize'];
  mask?: string;
  background?: BackgroundColor;
  emojiPaddingLeft?: BoxStyles['paddingLeft'];
  emojiPaddingTop?: BoxStyles['paddingTop'];
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
      {isFetched && address ? (
        <>
          {avatar?.imageUrl ? (
            <Avatar.Image mask={mask} size={size} imageUrl={avatar.imageUrl} />
          ) : (
            <Avatar.Emoji
              color={avatar?.color}
              emoji={avatar?.emoji}
              size={emojiSize}
              mask={mask}
              paddingLeft={emojiPaddingLeft}
              paddingTop={emojiPaddingTop}
            />
          )}
        </>
      ) : null}
      <Avatar.Skeleton />
    </Box>
  );
}
