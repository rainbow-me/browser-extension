import { motion, useScroll, useTransform } from 'framer-motion';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';

import { Box, Inline, Inset, Stack, Symbol, Text } from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';

import { AccountName } from '../../components/AccountName/AccountName';
import { Avatar } from '../../components/Avatar/Avatar';
import { useAvatar } from '../../hooks/useAvatar';

export function Header() {
  const { scrollYProgress: progress } = useScroll({ offset: ['0px', '64px'] });
  const scaleValue = useTransform(progress, [0, 1], [1, 0.3]);
  const opacityValue = useTransform(progress, [0, 1], [1, 0]);

  return (
    <Box
      background="surfacePrimaryElevatedSecondary"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      position="relative"
      paddingTop="44px"
      testId="header"
    >
      <Inset>
        <Stack alignHorizontal="center" space="16px">
          <Box
            as={motion.div}
            display="flex"
            justifyContent="center"
            position="absolute"
            style={{
              opacity: opacityValue,
              scale: scaleValue,
              transformOrigin: 'bottom',
              zIndex: 1,
              top: -28,
            }}
          >
            <AvatarSection />
          </Box>
          <AccountName id="header" />
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
            <ActionButton symbol="square.on.square" text="Copy" />
          </Link>
          <ActionButton symbol="arrow.triangle.swap" text="Swap" />
          <Link to="/send">
            <ActionButton symbol="paperplane.fill" text="Send" />
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
  symbol: SymbolProps['symbol'];
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
        <Symbol size={15} symbol={symbol} color="label" weight="semibold" />
      </Box>
      <Text color="labelSecondary" size="12pt" weight="semibold">
        {text}
      </Text>
    </Stack>
  );
}
