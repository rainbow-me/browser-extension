import * as React from 'react';

import { Box, Text } from '~/design-system';

function Avatar({ imageUrl }: { imageUrl?: string }) {
  return (
    <AvatarWrapper>
      {imageUrl && <AvatarImage imageUrl={imageUrl} />}
      <AvatarSkeleton />
    </AvatarWrapper>
  );
}

function AvatarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Box
      borderRadius="round"
      position="relative"
      style={{
        height: '60px',
        width: '60px',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}

function AvatarContent({
  backgroundColor,
  children,
}: {
  backgroundColor?: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      top="0"
      left="0"
      right="0"
      bottom="0"
      style={{
        backgroundColor,
        zIndex: 1,
      }}
    >
      {children}
    </Box>
  );
}

function AvatarImage({ imageUrl }: { imageUrl?: string }) {
  return (
    <AvatarContent>
      <img src={imageUrl} width="100%" height="100%" loading="lazy" />
    </AvatarContent>
  );
}

function AvatarEmoji({ color, emoji }: { color?: string; emoji?: string }) {
  return (
    <AvatarContent backgroundColor={color}>
      <Text size="32pt" weight="bold">
        {emoji}
      </Text>
    </AvatarContent>
  );
}

function AvatarSkeleton() {
  return (
    <Box
      background="surfaceSecondaryElevated"
      top="0"
      left="0"
      right="0"
      bottom="0"
      style={{
        zIndex: 0,
      }}
    />
  );
}

Avatar.Emoji = AvatarEmoji;
Avatar.Image = AvatarImage;
Avatar.Skeleton = AvatarSkeleton;
Avatar.Wrapper = AvatarWrapper;

export { Avatar };
