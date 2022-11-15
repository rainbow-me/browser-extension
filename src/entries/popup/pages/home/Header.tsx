import { motion, useScroll, useTransform } from 'framer-motion';
import * as React from 'react';
import { useAccount } from 'wagmi';

import { Box, Inline, Inset, Stack, Text } from '~/design-system';

import { AccountName } from '../../components/AccountName/AccountName';
import { Avatar } from '../../components/Avatar/Avatar';
import { SFSymbol, SFSymbolProps } from '../../components/SFSymbol/SFSymbol';
import { useAvatar } from '../../hooks/useAvatar';

export function Header() {
  const { scrollYProgress: progress } = useScroll({ offset: ['0px', '64px'] });
  const scaleValue = useTransform(progress, [0, 1], [1, 0.3]);
  const opacityValue = useTransform(progress, [0, 1], [1, 0]);

  const { scrollYProgress: blurProgress } = useScroll({
    offset: ['10px', '60px'],
  });
  const blurValue = useTransform(
    blurProgress,
    (out) => `blur(${10 ** out - 1}px)`,
  );

  return (
    <Box
      background="surfacePrimaryElevatedSecondary"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      position="relative"
      paddingTop="44px"
    >
      <Inset>
        <Stack alignHorizontal="center" space="16px">
          <Box
            as={motion.div}
            display="flex"
            justifyContent="center"
            position="absolute"
            width="full"
            style={{
              filter: blurValue,
              opacity: opacityValue,
              scale: scaleValue,
              transformOrigin: 'bottom',
              zIndex: 1,
              top: -28,
            }}
          >
            <AvatarSection />
          </Box>
          <AccountName />
          <ActionButtonsSection />
        </Stack>
      </Inset>
      <Box style={{ minHeight: 32 }} />
    </Box>
  );
}

function AvatarSection() {
  const { address } = useAccount();
  const { avatar, isFetched } = useAvatar({ address });
  return (
    <Avatar.Wrapper size={60}>
      {isFetched ? (
        <>
          {avatar?.imageUrl ? (
            <Avatar.Image imageUrl={avatar.imageUrl} />
          ) : (
            <Avatar.Emoji color={avatar?.color} emoji={avatar?.emoji} />
          )}
        </>
      ) : null}
      <Avatar.Skeleton />
    </Avatar.Wrapper>
  );
}

function ActionButtonsSection() {
  const { address } = useAccount();
  const { avatar } = useAvatar({ address });
  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(address as string);
  }, [address]);
  return (
    <Box style={{ height: 56 }}>
      {avatar?.color && (
        <Inline space="12px">
          <Link onClick={handleCopy} to={''}>
            <ActionButton symbol="copy" text="Copy" />
          </Link>
          <ActionButton symbol="swap" text="Swap" />
          <Link to="/send">
            <ActionButton symbol="send" text="Send" />
          </Link>
        </Inline>
      )}
    </Box>
  );
}

function ActionButton({
  symbol,
  text,
}: {
  symbol: SFSymbolProps['symbol'];
  text: string;
}) {
  return (
    <Stack alignHorizontal="center" space="10px">
      <Box
        background="accent"
        borderRadius="round"
        boxShadow="12px accent"
        display="flex"
        alignItems="center"
        justifyContent="center"
        style={{
          width: '36px',
          height: '36px',
        }}
      >
        <SFSymbol symbol={symbol} color="label" />
      </Box>
      <Text color="labelSecondary" size="12pt" weight="semibold">
        {text}
      </Text>
    </Stack>
  );
}
