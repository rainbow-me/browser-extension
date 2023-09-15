/* eslint-disable no-nested-ternary */
import { motion, useMotionValueEvent, useTransform } from 'framer-motion';
import * as React from 'react';
import { useAccount } from 'wagmi';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { KeychainType } from '~/core/types/keychainTypes';
import { truncateAddress } from '~/core/utils/address';
import { POPUP_URL, goToNewTab } from '~/core/utils/tabs';
import { Box, ButtonSymbol, Inline, Inset, Stack, Text } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { BoxStyles, TextStyles } from '~/design-system/styles/core.css';

import { AccountName } from '../../components/AccountName/AccountName';
import { Avatar } from '../../components/Avatar/Avatar';
import { triggerToast } from '../../components/Toast/Toast';
import { CursorTooltip } from '../../components/Tooltip/CursorTooltip';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { useAvatar } from '../../hooks/useAvatar';
import { useCurrentWalletTypeAndVendor } from '../../hooks/useCurrentWalletType';
import { useIsFullScreen } from '../../hooks/useIsFullScreen';
import { useNavigateToSwaps } from '../../hooks/useNavigateToSwaps';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useScroll } from '../../hooks/useScroll';
import { useWallets } from '../../hooks/useWallets';
import { ROUTES } from '../../urls';
import { tabIndexes } from '../../utils/tabIndexes';
import { isFullScreen } from '../../utils/windows';

export const Header = React.memo(function Header() {
  const { featureFlags } = useFeatureFlagsStore();
  const { scrollYProgress: progress, scrollY } = useScroll({
    offset: ['0px', '64px', '92px'],
  });

  const scaleValue = useTransform(progress, [0, 0.25, 1], [1, 0.3, 0]);
  const opacityValue = useTransform(progress, [0, 0.25], [1, 0]);

  const nameScaleValue = useTransform(progress, [0, 0.25, 1], [1, 1, 0.8]);
  const nameOpacityValue = useTransform(progress, (v) => (v === 1 ? 0 : 1));

  const x = useTransform(progress, [0, 0.25, 1], [-12, -12, 0]);
  const y = useTransform(progress, [0, 1], [0, 2]);
  const avatarOpacityValue = useTransform(progress, [0, 0.25, 1], [0, 0, 1]);

  const [tooltipOffset, setTooltipOffset] = React.useState(scrollY.get());

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setTooltipOffset(latest);
  });

  const { address } = useAccount();

  return (
    <Box
      background="surfacePrimaryElevatedSecondary"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      position="relative"
      paddingTop="40px"
      testId="header"
    >
      <Inset>
        <Stack alignHorizontal="center" space="6px">
          <Box
            as={motion.div}
            display="flex"
            justifyContent="center"
            paddingBottom="2px"
            position="absolute"
            style={{
              opacity: opacityValue,
              scale: scaleValue,
              transformOrigin: 'bottom',
              zIndex: 1,
              top: -27,
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
              y,
            }}
          >
            <AccountName
              avatar={
                address && (
                  <Box
                    as={motion.div}
                    style={{ opacity: avatarOpacityValue }}
                    paddingRight="2px"
                  >
                    <WalletAvatar
                      addressOrName={address}
                      size={20}
                      emojiSize="14pt"
                    />
                  </Box>
                )
              }
              id="header"
              tabIndex={tabIndexes.WALLET_HEADER_ACCOUNT_NAME}
              renderTooltip={
                tooltipOffset === 0
                  ? (content) => (
                      <CursorTooltip
                        align="start"
                        arrowAlignment="center"
                        text={i18n.t('tooltip.switch_wallet')}
                        textWeight="bold"
                        textSize="12pt"
                        textColor="labelSecondary"
                        hint={shortcuts.home.GO_TO_WALLETS.display}
                        marginLeft={isFullScreen ? '-620px' : '-20px'}
                        marginTop={isFullScreen ? '-204px' : '-110px'}
                      >
                        {content}
                      </CursorTooltip>
                    )
                  : undefined
              }
            />
          </Box>
          <ActionButtonsSection />
        </Stack>
      </Inset>
      <Box style={{ minHeight: featureFlags.new_tab_bar_enabled ? 28 : 32 }} />
    </Box>
  );
});

export function AvatarSection() {
  const { address } = useAccount();
  const { data: avatar } = useAvatar({ addressOrName: address });

  return (
    <Avatar.Wrapper size={60} color={avatar?.color}>
      <>
        {avatar?.imageUrl ? (
          <Avatar.Image size={60} imageUrl={avatar.imageUrl} />
        ) : (
          <Avatar.Emoji color={avatar?.color} emoji={avatar?.emoji} />
        )}
      </>
      <Avatar.Skeleton />
    </Avatar.Wrapper>
  );
}

function ActionButtonsSection() {
  const { address } = useAccount();
  const { data: avatar } = useAvatar({ addressOrName: address });

  const { isWatchingWallet } = useWallets();
  const { featureFlags } = useFeatureFlagsStore();
  const navigate = useRainbowNavigate();
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

  const { type, vendor } = useCurrentWalletTypeAndVendor();

  const isTrezor = React.useMemo(() => {
    return type === KeychainType.HardwareWalletKeychain && vendor === 'Trezor';
  }, [type, vendor]);

  const isFullScreen = useIsFullScreen();

  const shouldNavigateToSend = React.useMemo(() => {
    // Trezor should always be in a new tab
    if ((isTrezor && !isFullScreen) || !allowSend) {
      return false;
    }

    return true;
  }, [allowSend, isFullScreen, isTrezor]);

  const handleSendFallback = React.useCallback(() => {
    if (!allowSend) {
      alertWatchingWallet();
    } else {
      // Trezor needs to be opened in a new tab because of their own popup
      return (
        isTrezor &&
        !isFullScreen &&
        goToNewTab({ url: POPUP_URL + `#${ROUTES.SEND}?hideBack=true` })
      );
    }
  }, [alertWatchingWallet, allowSend, isFullScreen, isTrezor]);

  return (
    <Box style={{ height: 54 }}>
      {avatar?.color && (
        <Inline space="12px">
          <ActionButton
            symbol="square.on.square"
            text={i18n.t('wallet_header.copy')}
            onClick={handleCopy}
            testId="header-link-copy"
            tabIndex={tabIndexes.WALLET_HEADER_COPY_BUTTON}
            tooltipHint={shortcuts.home.COPY_ADDRESS.display}
            tooltipText={i18n.t('tooltip.copy_address')}
          />

          <ActionButton
            symbol="arrow.triangle.swap"
            text={i18n.t('wallet_header.swap')}
            tabIndex={tabIndexes.WALLET_HEADER_SWAP_BUTTON}
            testId={'header-link-swap'}
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
            tooltipHint={shortcuts.home.GO_TO_SWAP.display}
            tooltipText={i18n.t('tooltip.swap')}
          />

          <ActionButton
            symbol="paperplane.fill"
            text={i18n.t('wallet_header.send')}
            tabIndex={tabIndexes.WALLET_HEADER_SEND_BUTTON}
            tooltipHint={shortcuts.home.GO_TO_SEND.display}
            tooltipText={i18n.t('tooltip.send')}
            testId={'header-link-send'}
            onClick={() => {
              if (allowSend) {
                navigate(ROUTES.SEND);
              } else {
                alertWatchingWallet();
              }
            }}
          />
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
  tooltipHint,
  tooltipText,
}: {
  cursor?: BoxStyles['cursor'];
  symbol: SymbolProps['symbol'];
  text: string;
  onClick?: () => void;
  testId?: string;
  tabIndex?: number;
  tooltipHint: string;
  tooltipText: string;
}) {
  return (
    <Stack alignHorizontal="center" space="10px">
      <CursorTooltip
        align="center"
        arrowAlignment="center"
        text={tooltipText}
        textWeight="bold"
        textSize="12pt"
        textColor="labelSecondary"
        marginLeft="18px"
        hint={tooltipHint}
      >
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
      </CursorTooltip>
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
