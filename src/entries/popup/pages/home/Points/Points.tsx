import { motion, useAnimation } from 'framer-motion';
import { useEffect, useMemo } from 'react';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { KeychainType } from '~/core/types/keychainTypes';
import { TESTNET_MODE_BAR_HEIGHT } from '~/core/utils/dimensions';
import { POPUP_URL, goToNewTab, isNativePopup } from '~/core/utils/tabs';
import { Box, Button, Inset, Stack, Text } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import {
  backgroundColors,
  globalColors,
} from '~/design-system/styles/designTokens';
import { useCurrentWalletTypeAndVendor } from '~/entries/popup/hooks/useCurrentWalletType';
import { useWallets } from '~/entries/popup/hooks/useWallets';

import { ICON_SIZE } from '../../../components/Tabs/TabBar';
import PointsSelectedIcon from '../../../components/Tabs/TabIcons/PointsSelected';
import { useAvatar } from '../../../hooks/useAvatar';
import { useCoolMode } from '../../../hooks/useCoolMode';
import { useRainbowNavigate } from '../../../hooks/useRainbowNavigate';
import { ROUTES } from '../../../urls';

import { PointsDashboard } from './PointsDashboard';
import { usePoints } from './usePoints';

const animationSteps = {
  one: {
    scale: 0.9,
    rotate: -372,
    x: 0,
    y: 10.5,
    transition: { duration: 0.5, ease: [0.2, 0, 0, 1] },
  },
  two: {
    scale: 1.3,
    rotate: -12,
    x: 0,
    y: -16,
    transition: { duration: 2.5, ease: [0.05, 0.7, 0.1, 1.0] },
  },
  three: {
    scale: 1.2,
    rotate: -4,
    x: 4,
    y: -4,
    transition: { duration: 2, ease: [0.2, 0, 0, 1] },
  },
  four: {
    scale: 1.1,
    rotate: -12,
    x: 0,
    y: 8,
    transition: { duration: 2, ease: [0.2, 0, 0, 1] },
  },
  five: {
    scale: 0.9,
    rotate: -12,
    x: 0,
    y: 10.5,
    transition: { duration: 0.5, ease: [0.2, 0, 0, 1] },
  },
  six: {
    scale: 1.3,
    rotate: -372,
    x: 0,
    y: -16,
    transition: { duration: 2.5, ease: [0.05, 0.7, 0.1, 1.0] },
  },
  seven: {
    scale: 1.2,
    rotate: -380,
    x: -4,
    y: -4,
    transition: { duration: 2, ease: [0.2, 0, 0, 1] },
  },
  eight: {
    scale: 1.1,
    rotate: -372,
    x: 0,
    y: 8,
    transition: { duration: 2, ease: [0.2, 0, 0, 1] },
  },
};

const PointsContentPlaceholder = () => {
  return (
    <Inset bottom="10px" horizontal="80px">
      <Stack space="16px">
        <Text
          align="center"
          size="20pt"
          weight="semibold"
          color="labelTertiary"
        >
          {i18n.t('points.coming_soon_header')}
        </Text>
        <Text
          align="center"
          color="labelQuaternary"
          size="12pt"
          weight="medium"
        >
          {i18n.t('points.coming_soon_description')}
        </Text>
      </Stack>
    </Inset>
  );
};

const PointsContent = () => {
  const navigate = useRainbowNavigate();
  const { isWatchingWallet } = useWallets();
  const { featureFlags } = useFeatureFlagsStore();

  const allowOnboarding = useMemo(
    () => !isWatchingWallet || featureFlags.full_watching_wallets,
    [featureFlags.full_watching_wallets, isWatchingWallet],
  );
  const alertWatchingWallet = () =>
    triggerAlert({
      text: i18n.t('alert.wallet_watching_mode'),
    });

  const { type } = useCurrentWalletTypeAndVendor();
  const isHardwareWallet = type === KeychainType.HardwareWalletKeychain;

  const pointsNavigate = async (to: string) => {
    if (!allowOnboarding) return alertWatchingWallet();

    if (isHardwareWallet && (await isNativePopup())) {
      goToNewTab({ url: POPUP_URL + `#${to}` });
      return;
    }

    navigate(to, { state: { skipTransitionOnRoute: ROUTES.HOME } });
  };

  return (
    <Stack alignHorizontal="center" space="16px">
      <Inset bottom="10px" horizontal="80px">
        <Stack space="16px">
          <Text
            align="center"
            size="20pt"
            weight="semibold"
            color="labelTertiary"
          >
            {i18n.t('points.header')}
          </Text>
          <Text
            align="center"
            color="labelQuaternary"
            size="12pt"
            weight="medium"
          >
            {i18n.t('points.description')}
          </Text>
        </Stack>
      </Inset>
      <Button
        onClick={() => pointsNavigate(ROUTES.POINTS_ONBOARDING)}
        color="accent"
        height="36px"
        variant="raised"
      >
        {i18n.t('points.get_started')}
      </Button>
      <Button
        onClick={() => pointsNavigate(ROUTES.POINTS_REFERRAL)}
        color="accent"
        height="36px"
        variant="tinted"
      >
        {i18n.t('points.use_referral_code')}
      </Button>
    </Stack>
  );
};

function ClaimYourPoints() {
  const ref = useCoolMode({ emojis: ['🌈', '🎰'] });
  const { currentAddress } = useCurrentAddressStore();
  const { data: avatar } = useAvatar({ addressOrName: currentAddress });
  const { currentTheme } = useCurrentThemeStore();
  const { testnetMode } = useTestnetModeStore();
  const { featureFlags } = useFeatureFlagsStore();

  const controls = useAnimation();

  useEffect(() => {
    const sequenceAnimations = async () => {
      await controls.start('one');
      await controls.start('two');
      await controls.start('three');
      await controls.start('four');
      await controls.start('five');
      await controls.start('six');
      await controls.start('seven');
      await controls.start('eight');
      sequenceAnimations();
    };
    sequenceAnimations();
  }, [controls]);

  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      marginTop="-20px"
      paddingTop={
        featureFlags.points || config.points_enabled ? '40px' : '80px'
      }
      ref={ref}
      style={{ height: 336 - (testnetMode ? TESTNET_MODE_BAR_HEIGHT : 0) }}
      width="full"
    >
      <Stack space="14px">
        <Box
          alignItems="center"
          display="flex"
          justifyContent="center"
          style={{
            transform: 'translateY(-4px)',
          }}
        >
          <Box
            as={motion.div}
            animate={controls}
            alignItems="center"
            display="flex"
            initial={{ scale: 1.1, rotate: -372, x: 0, y: 8 }}
            justifyContent="center"
            key="pointsAnimation"
            style={{
              height: 28,
              width: 28,
              willChange: 'transform',
            }}
            variants={animationSteps}
          >
            <Box
              position="relative"
              style={{
                height: ICON_SIZE,
                transform: 'scale(0.5)',
                transformOrigin: 'top left',
                width: ICON_SIZE,
                willChange: 'transform',
              }}
            >
              <PointsSelectedIcon
                accentColor={avatar?.color || globalColors.blue50}
                colorMatrixValues={null}
                tintBackdrop={
                  currentTheme === 'dark'
                    ? backgroundColors.surfacePrimaryElevated.dark.color
                    : backgroundColors.surfacePrimaryElevated.light.color
                }
                tintOpacity={currentTheme === 'dark' ? 0.2 : 0}
              />
            </Box>
          </Box>
        </Box>
        {featureFlags.points || config.points_enabled ? (
          <PointsContent />
        ) : (
          <PointsContentPlaceholder />
        )}
      </Stack>
    </Box>
  );
}

export function Points() {
  const { currentAddress } = useCurrentAddressStore();
  const { data, isInitialLoading } = usePoints(currentAddress);

  const { featureFlags } = useFeatureFlagsStore();
  const isPointsEnabled = featureFlags.points || config.points_enabled;

  if (isInitialLoading) return null;

  if (!isPointsEnabled || data?.error?.type === 'NON_EXISTING_USER')
    return <ClaimYourPoints />;
  return <PointsDashboard />;
}
