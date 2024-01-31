import { AccentColorProvider, Box } from '~/design-system';
import { BoxStyles, TextStyles } from '~/design-system/styles/core.css';
import { BackgroundColor } from '~/design-system/styles/designTokens';

import { Avatar } from '../../components/Avatar/Avatar';
import { useAvatar } from '../../hooks/useAvatar';

export function WalletAvatar({
  avatarUrl,
  addressOrName,
  size,
  emojiSize,
  mask,
  background,
  emojiPaddingLeft,
  emojiPaddingTop,
  boxShadow,
}: {
  avatarUrl?: string | null;
  addressOrName?: string;
  size: number;
  emojiSize?: TextStyles['fontSize'];
  mask?: string;
  background?: BackgroundColor;
  emojiPaddingLeft?: BoxStyles['paddingLeft'];
  emojiPaddingTop?: BoxStyles['paddingTop'];
  boxShadow?: BoxStyles['boxShadow'];
}) {
  const { data: avatar } = useAvatar({ addressOrName, avatarUrl });

  return (
    <AccentColorProvider color={avatar?.color || '#000000'}>
      {addressOrName ? (
        <Box
          borderRadius="round"
          boxShadow={boxShadow}
          position="relative"
          background={background}
          style={{
            height: size,
            width: size,
            overflow: 'hidden',
          }}
        >
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
          <Avatar.Skeleton />
        </Box>
      ) : (
        <Box
          background="fillQuaternary"
          borderColor="separatorTertiary"
          borderRadius="round"
          borderWidth="1px"
          style={{ height: size, width: size }}
        />
      )}
    </AccentColorProvider>
  );
}
