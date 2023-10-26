import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { TESTNET_MODE_BAR_HEIGHT } from '~/core/utils/dimensions';
import { Box, Inset, Stack, Text } from '~/design-system';
import {
  backgroundColors,
  globalColors,
} from '~/design-system/styles/designTokens';

import { ICON_SIZE } from '../../components/Tabs/TabBar';
import PointsSelectedIcon from '../../components/Tabs/TabIcons/PointsSelected';
import { useAvatar } from '../../hooks/useAvatar';
import { useCoolMode } from '../../hooks/useCoolMode';

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

export function Points() {
  const ref = useCoolMode({ emojis: ['🌈', '🎰'] });
  const { currentAddress } = useCurrentAddressStore();
  const { data: avatar } = useAvatar({ addressOrName: currentAddress });
  const { currentTheme } = useCurrentThemeStore();
  const { testnetMode } = useTestnetModeStore();

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
      paddingTop="80px"
      ref={ref}
      style={{ height: 336 - (testnetMode ? TESTNET_MODE_BAR_HEIGHT : 0) }}
      width="full"
    >
      <Box paddingBottom="14px">
        <Stack alignHorizontal="center" space="16px">
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
          <Text
            align="center"
            size="20pt"
            weight="semibold"
            color="labelTertiary"
          >
            {i18n.t('points.coming_soon_header')}
          </Text>
        </Stack>
      </Box>
      <Inset bottom="10px" horizontal="80px">
        <Text
          align="center"
          color="labelQuaternary"
          size="12pt"
          weight="medium"
        >
          {i18n.t('points.coming_soon_description')}
        </Text>
      </Inset>
    </Box>
  );
}
