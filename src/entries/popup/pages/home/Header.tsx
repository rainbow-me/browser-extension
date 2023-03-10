import { motion, useScroll, useTransform } from 'framer-motion';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';

import { i18n } from '~/core/languages';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { truncateAddress } from '~/core/utils/address';
import { Box, ButtonSymbol, Inline, Inset, Stack, Text } from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';

import { AccountName } from '../../components/AccountName/AccountName';
import { Avatar } from '../../components/Avatar/Avatar';
import { useAvatar } from '../../hooks/useAvatar';
import { useToast } from '../../hooks/useToast';
import { useWallets } from '../../hooks/useWallets';
import { ROUTES } from '../../urls';
import { tabIndexes } from '../../utils/tabIndexes';

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

export function AvatarSection() {
  const { address } = useAccount();
  const { avatar, isFetched } = useAvatar({ address });
  return (
    <Avatar.Wrapper size={60} color={avatar?.color}>
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

  const { watchedWallets } = useWallets();
  const { triggerToast } = useToast();
  const { featureFlags } = useFeatureFlagsStore();

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(address as string);
    triggerToast({
      title: i18n.t('wallet_header.copy_toast'),
      description: truncateAddress(address),
    });
  }, [address, triggerToast]);

  const isWatchingWallet = React.useMemo(() => {
    const watchedAddresses = watchedWallets.map(({ address }) => address);
    return address && watchedAddresses.includes(address);
  }, [address, watchedWallets]);

  const allowSwap = React.useMemo(
    () =>
      (!isWatchingWallet || featureFlags.full_watching_wallets) &&
      featureFlags.swaps,
    [featureFlags.full_watching_wallets, featureFlags.swaps, isWatchingWallet],
  );

  const allowSend = React.useMemo(
    () => !isWatchingWallet || featureFlags.full_watching_wallets,
    [featureFlags.full_watching_wallets, isWatchingWallet],
  );

  const alertWatchingWallet = React.useCallback(() => {
    // this will be removed so not adding it to lang file
    alert('This wallet is currently in "Watching" mode');
  }, []);

  return (
    <Box style={{ height: 56 }}>
      {avatar?.color && (
        <Inline space="12px">
          <ActionButton
            symbol="square.on.square"
            text={i18n.t('wallet_header.copy')}
            onClick={handleCopy}
            testId="header-link-copy"
            tabIndex={tabIndexes.WALLET_HEADER_COPY_BUTTON}
          />
          <Link
            id="header-link-swap"
            to={allowSwap ? ROUTES.SWAP : '#'}
            state={{ from: ROUTES.HOME }}
            onClick={allowSwap ? () => null : alertWatchingWallet}
          >
            <ActionButton
              symbol="arrow.triangle.swap"
              text={i18n.t('wallet_header.swap')}
              tabIndex={tabIndexes.WALLET_HEADER_SWAP_BUTTON}
            />
          </Link>

          <Link
            id="header-link-send"
            to={allowSend ? ROUTES.SEND : '#'}
            state={{ from: ROUTES.HOME, to: ROUTES.SEND }}
            onClick={allowSend ? () => null : alertWatchingWallet}
          >
            <ActionButton
              symbol="paperplane.fill"
              text={i18n.t('wallet_header.send')}
              tabIndex={tabIndexes.WALLET_HEADER_SEND_BUTTON}
            />
          </Link>
        </Inline>
      )}
    </Box>
  );
}

function ActionButton({
  symbol,
  text,
  onClick,
  testId,
  tabIndex,
}: {
  symbol: SymbolProps['symbol'];
  text: string;
  onClick?: () => void;
  testId?: string;
  tabIndex?: number;
}) {
  return (
    <Stack alignHorizontal="center" space="10px">
      <ButtonSymbol
        color="accent"
        height="36px"
        variant="raised"
        symbol={symbol}
        testId={testId}
        onClick={onClick}
        tabIndex={tabIndex}
      />
      <Text color="labelSecondary" size="12pt" weight="semibold">
        {text}
      </Text>
    </Stack>
  );
}
