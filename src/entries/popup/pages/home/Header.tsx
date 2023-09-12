/* eslint-disable no-nested-ternary */
import { motion, useMotionValueEvent, useTransform } from 'framer-motion';
import * as React from 'react';
import { useAccount } from 'wagmi';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { truncateAddress } from '~/core/utils/address';
import { Box, ButtonSymbol, Inline, Inset, Stack, Text } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { BoxStyles, TextStyles } from '~/design-system/styles/core.css';

import { AccountName } from '../../components/AccountName/AccountName';
import { Avatar } from '../../components/Avatar/Avatar';
import { Link } from '../../components/Link/Link';
import { triggerToast } from '../../components/Toast/Toast';
import { CursorTooltip } from '../../components/Tooltip/CursorTooltip';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { useAvatar } from '../../hooks/useAvatar';
import { useNavigateToSwaps } from '../../hooks/useNavigateToSwaps';
import { useScroll } from '../../hooks/useScroll';
import { useWallets } from '../../hooks/useWallets';
import { ROUTES } from '../../urls';
import { tabIndexes } from '../../utils/tabIndexes';

export const Header = React.memo(function Header() {
  const { scrollYProgress: progress, scrollY } = useScroll({
    offset: ['0px', '64px', '92px'],
  });

  const scaleValue = useTransform(progress, [0, 0.25, 1], [1, 0.3, 0]);
  const opacityValue = useTransform(progress, [0, 0.25], [1, 0]);

  const nameScaleValue = useTransform(progress, [0, 0.25, 1], [1, 1, 0.8]);
  const nameOpacityValue = useTransform(progress, (v) => (v === 1 ? 0 : 1));

  const x = useTransform(progress, [0, 0.25, 1], [-12, -12, 0]);
  const avatarOpacityValue = useTransform(progress, [0, 0.25, 1], [0, 0, 1]);

  const [tooltipOffset, setTooltipOffset] = React.useState(scrollY.get());

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setTooltipOffset(latest);
  });

  const { address } = useAccount();

  const accountName = (
    <AccountName
      avatar={
        address && (
          <Box
            as={motion.div}
            style={{ opacity: avatarOpacityValue }}
            paddingRight="2px"
          >
            <WalletAvatar address={address} size={20} emojiSize="14pt" />
          </Box>
        )
      }
      id="header"
      tabIndex={tabIndexes.WALLET_HEADER_ACCOUNT_NAME}
    />
  );

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
        <Stack alignHorizontal="center" space="8px">
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
          <Box
            as={motion.div}
            paddingHorizontal="12px"
            style={{
              zIndex: 1,
              scale: nameScaleValue,
              opacity: nameOpacityValue,
              x,
            }}
          >
            {tooltipOffset < 92 ? (
              <CursorTooltip
                align="start"
                arrowAlignment="center"
                text={i18n.t('tooltip.switch_wallet')}
                textWeight="bold"
                textSize="12pt"
                textColor="labelSecondary"
                marginLeft="22px"
                marginTop={
                  tooltipOffset > 46 ? `${55 + (tooltipOffset - 40)}px` : '0px'
                }
                arrowDirection={tooltipOffset > 46 ? 'up' : 'down'}
                hint={shortcuts.home.GO_TO_WALLETS.display}
              >
                {accountName}
              </CursorTooltip>
            ) : (
              accountName
            )}
          </Box>

          <ActionButtonsSection tooltipOffset={tooltipOffset} />
        </Stack>
      </Inset>
      <Box style={{ minHeight: 32 }} />
    </Box>
  );
});

export function AvatarSection() {
  const { address } = useAccount();
  const { avatar, isFetched } = useAvatar({ address });
  return (
    <Avatar.Wrapper size={60} color={avatar?.color}>
      {isFetched ? (
        <>
          {avatar?.imageUrl ? (
            <Avatar.Image size={60} imageUrl={avatar.imageUrl} />
          ) : (
            <Avatar.Emoji color={avatar?.color} emoji={avatar?.emoji} />
          )}
        </>
      ) : null}
      <Avatar.Skeleton />
    </Avatar.Wrapper>
  );
}

function ActionButtonsSection({ tooltipOffset }: { tooltipOffset: number }) {
  const { address } = useAccount();
  const { avatar } = useAvatar({ address });

  const { isWatchingWallet } = useWallets();
  const { featureFlags } = useFeatureFlagsStore();
  const navigateToSwaps = useNavigateToSwaps();

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(address as string);
    triggerToast({
      title: i18n.t('wallet_header.copy_toast'),
      description: truncateAddress(address),
    });
  }, [address]);

  const allowSwap = React.useMemo(
    () =>
      (!isWatchingWallet || featureFlags.full_watching_wallets) &&
      config.swaps_enabled,
    [featureFlags.full_watching_wallets, isWatchingWallet],
  );

  const allowSend = React.useMemo(
    () => !isWatchingWallet || featureFlags.full_watching_wallets,
    [featureFlags.full_watching_wallets, isWatchingWallet],
  );

  const alertWatchingWallet = React.useCallback(() => {
    triggerAlert({ text: i18n.t('alert.wallet_watching_mode') });
  }, []);

  const alertComingSoon = React.useCallback(() => {
    triggerAlert({ text: i18n.t('alert.coming_soon') });
  }, []);

  return (
    <Box style={{ height: 56 }}>
      {avatar?.color && (
        <Inline space="12px">
          <CursorTooltip
            align="center"
            arrowAlignment="center"
            text={i18n.t('tooltip.copy_address')}
            textWeight="bold"
            textSize="12pt"
            textColor="labelSecondary"
            marginLeft="18px"
            marginTop={`${0 - tooltipOffset}px`}
            hint={shortcuts.home.COPY_ADDRESS.display}
          >
            <ActionButton
              symbol="square.on.square"
              text={i18n.t('wallet_header.copy')}
              onClick={handleCopy}
              testId="header-link-copy"
              tabIndex={tabIndexes.WALLET_HEADER_COPY_BUTTON}
            />
          </CursorTooltip>

          <Link
            tabIndex={-1}
            id="header-link-swap"
            to={'#'}
            state={{ from: ROUTES.HOME, to: ROUTES.SWAP }}
            onClick={() => {
              if (!allowSwap) {
                if (isWatchingWallet) {
                  alertWatchingWallet();
                } else {
                  alertComingSoon();
                }
              } else {
                navigateToSwaps();
              }
            }}
          >
            <CursorTooltip
              align="center"
              arrowAlignment="center"
              text={i18n.t('tooltip.swap')}
              textWeight="bold"
              textSize="12pt"
              textColor="labelSecondary"
              marginLeft="18px"
              marginTop={`${0 - tooltipOffset}px`}
              hint={shortcuts.home.GO_TO_SWAP.display}
            >
              <ActionButton
                symbol="arrow.triangle.swap"
                testId="header-link-swap"
                text={i18n.t('wallet_header.swap')}
                tabIndex={tabIndexes.WALLET_HEADER_SWAP_BUTTON}
              />
            </CursorTooltip>
          </Link>

          <Link
            tabIndex={-1}
            id="header-link-send"
            to={allowSend ? ROUTES.SEND : '#'}
            state={{ from: ROUTES.HOME, to: ROUTES.SEND }}
            onClick={allowSend ? () => null : alertWatchingWallet}
          >
            <CursorTooltip
              align="center"
              arrowAlignment="center"
              text={i18n.t('tooltip.send')}
              textWeight="bold"
              textSize="12pt"
              textColor="labelSecondary"
              marginLeft="18px"
              marginTop={`${0 - tooltipOffset}px`}
              hint={shortcuts.home.GO_TO_SEND.display}
            >
              <ActionButton
                symbol="paperplane.fill"
                text={i18n.t('wallet_header.send')}
                tabIndex={tabIndexes.WALLET_HEADER_SEND_BUTTON}
              />
            </CursorTooltip>
          </Link>
        </Inline>
      )}
    </Box>
  );
}

function ActionButton({
  cursor = 'default',
  symbol,
  text,
  onClick,
  testId,
  tabIndex,
}: {
  cursor?: BoxStyles['cursor'];
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
        cursor={cursor}
        height="36px"
        variant="raised"
        symbol={symbol}
        testId={testId}
        onClick={onClick}
        tabIndex={tabIndex}
      />
      <Text
        color="labelSecondary"
        cursor={cursor as TextStyles['cursor']}
        size="12pt"
        weight="semibold"
      >
        {text}
      </Text>
    </Stack>
  );
}
