import { motion, useAnimationControls } from 'framer-motion';
import React, { useEffect } from 'react';

import rainbowLight from 'static/assets/rainbow/light-rainbow.png';
import rainbowLight2x from 'static/assets/rainbow/light-rainbow@2x.png';
import rainbowNeon from 'static/assets/rainbow/neon-rainbow.png';
import rainbowNeon2x from 'static/assets/rainbow/neon-rainbow@2x.png';
import rainbowOg from 'static/assets/rainbow/og-rainbow.png';
import rainbowOg2x from 'static/assets/rainbow/og-rainbow@2x.png';
import rainbowPixel from 'static/assets/rainbow/pixel-rainbow.png';
import rainbowPixel2x from 'static/assets/rainbow/pixel-rainbow@2x.png';
import rainbowWhite from 'static/assets/rainbow/white-rainbow.png';
import rainbowWhite2x from 'static/assets/rainbow/white-rainbow@2x.png';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box } from '~/design-system';

import { useIsFullScreen } from '../../hooks/useIsFullScreen';
import usePrevious from '../../hooks/usePrevious';

import {
  FlyingRainbowsScreen,
  RAINBOW_POSITION,
  RAINBOW_STYLE,
  RAINBOW_TRANSITION,
} from './utils';

export function FlyingRainbows({
  children,
  screen = 'welcome',
}: {
  children: React.ReactNode;
  screen?: FlyingRainbowsScreen | '';
}) {
  const isFullscreen = useIsFullScreen();
  const rainbowPixelControls = useAnimationControls();
  const rainbowWhiteControls = useAnimationControls();
  const rainbowOgControls = useAnimationControls();
  const rainbowLightControls = useAnimationControls();
  const rainbowNeonControls = useAnimationControls();
  const prevScreen = usePrevious(screen);

  useEffect(() => {
    if (prevScreen === 'invite_code' && screen === 'welcome') {
      rainbowPixelControls.start(RAINBOW_POSITION.rainbowPixel.welcome);
      rainbowWhiteControls.start(RAINBOW_POSITION.rainbowWhite.welcome);
      rainbowOgControls.start(RAINBOW_POSITION.rainbowOg.welcome);
      rainbowLightControls.start(RAINBOW_POSITION.rainbowLight.welcome);
      rainbowNeonControls.start(RAINBOW_POSITION.rainbowNeon.welcome);
    } else if (prevScreen === 'welcome' && screen === 'invite_code') {
      rainbowPixelControls.start(RAINBOW_POSITION.rainbowPixel.invite_code);
      rainbowWhiteControls.start(RAINBOW_POSITION.rainbowWhite.invite_code);
      rainbowOgControls.start(RAINBOW_POSITION.rainbowOg.invite_code);
      rainbowLightControls.start(RAINBOW_POSITION.rainbowLight.invite_code);
      rainbowNeonControls.start(RAINBOW_POSITION.rainbowNeon.invite_code);
    }
  }, [
    prevScreen,
    rainbowLightControls,
    rainbowNeonControls,
    rainbowOgControls,
    rainbowPixelControls,
    rainbowWhiteControls,
    screen,
  ]);

  const animationScreen = screen === '' ? 'welcome' : screen;

  return (
    <Box
      background="surfaceSecondary"
      display="flex"
      flexDirection="column"
      alignItems="center"
      borderRadius={isFullscreen ? '32px' : undefined}
      paddingHorizontal="24px"
      paddingVertical="16px"
      style={{
        width: POPUP_DIMENSIONS.width,
        height: POPUP_DIMENSIONS.height,
        alignSelf: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        position="absolute"
        background="transparent"
        top="0"
        left="0"
        right="0"
        bottom="0"
      >
        <Box
          as={motion.img}
          src={rainbowWhite}
          srcSet={`${rainbowWhite2x} 2x`}
          position="absolute"
          style={RAINBOW_STYLE.rainbowWhite}
          initial={RAINBOW_POSITION.rainbowWhite[animationScreen]}
          animate={rainbowWhiteControls}
          transition={RAINBOW_TRANSITION}
        />
        <Box
          as={motion.img}
          src={rainbowPixel}
          srcSet={`${rainbowPixel2x} 2x`}
          position="absolute"
          style={RAINBOW_STYLE.rainbowPixel}
          initial={RAINBOW_POSITION.rainbowPixel[animationScreen]}
          animate={rainbowPixelControls}
          transition={RAINBOW_TRANSITION}
        />
        <Box
          as={motion.img}
          src={rainbowOg}
          srcSet={`${rainbowOg2x} 2x`}
          position="absolute"
          style={RAINBOW_STYLE.rainbowOg}
          initial={RAINBOW_POSITION.rainbowOg[animationScreen]}
          animate={rainbowOgControls}
          transition={RAINBOW_TRANSITION}
        />
        <Box
          as={motion.img}
          src={rainbowLight}
          srcSet={`${rainbowLight2x} 2x`}
          position="absolute"
          style={RAINBOW_STYLE.rainbowLight}
          initial={RAINBOW_POSITION.rainbowLight[animationScreen]}
          animate={rainbowLightControls}
          transition={RAINBOW_TRANSITION}
        />
        <Box
          as={motion.img}
          src={rainbowNeon}
          srcSet={`${rainbowNeon2x} 2x`}
          position="absolute"
          style={RAINBOW_STYLE.rainbowNeon}
          initial={RAINBOW_POSITION.rainbowNeon[animationScreen]}
          animate={rainbowNeonControls}
          transition={RAINBOW_TRANSITION}
        />
      </Box>
      {children}
    </Box>
  );
}
