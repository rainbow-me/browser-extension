import { motion } from 'framer-motion';
import * as React from 'react';

import rainbowLight from 'static/assets/rainbow/light-rainbow.png';
import rainbowNeon from 'static/assets/rainbow/neon-rainbow.png';
import rainbowOg from 'static/assets/rainbow/og-rainbow.png';
import rainbowPixel from 'static/assets/rainbow/pixel-rainbow.png';
import rainbowWhite from 'static/assets/rainbow/white-rainbow.png';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box } from '~/design-system';

import { useIsFullScreen } from '../../hooks/useIsFullScreen';

type FlyingRainbowsScreen = 'unlock' | 'invite_code';

const RAINBOWS_POSITION: {
  [key in FlyingRainbowsScreen]: {
    [key in
      | 'rainbowPixel'
      | 'rainbowWhite'
      | 'rainbowOg'
      | 'rainbowLight'
      | 'rainbowNeon']: {
      left?: string;
      right?: string;
      top?: string;
      bottom?: string;
    };
  };
} = {
  unlock: {
    rainbowPixel: {
      right: '0px',
      top: '0px',
    },
    rainbowWhite: {
      left: '0px',
      top: '0px',
    },
    rainbowOg: {
      left: '0px',
      top: '362px',
    },
    rainbowLight: {
      left: '100px',
      top: '370px',
    },
    rainbowNeon: {
      right: '-5px',
      bottom: '0px',
    },
  },
  invite_code: {
    rainbowPixel: {
      right: '-15.64px',
      top: '-79px',
    },
    rainbowWhite: {
      left: '-58.66px',
      top: '-45.44px',
    },
    rainbowOg: {
      left: '-30px',
      top: '392px',
    },
    rainbowLight: {
      left: '4.89px',
      top: '509.26px',
    },
    rainbowNeon: {
      right: '-68.93px',
      bottom: '-9.36px',
    },
  },
};

export function FlyingRainbows({
  children,
  screen = 'unlock',
}: {
  children: React.ReactNode;
  screen?: FlyingRainbowsScreen;
}) {
  const isFullscreen = useIsFullScreen();

  return (
    <Box
      borderColor="separatorSecondary"
      borderWidth="1px"
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
          src={rainbowPixel}
          position="absolute"
          style={{
            width: '150px',
            height: '150px',
          }}
          initial={{
            ...RAINBOWS_POSITION[screen].rainbowPixel,
          }}
          animate={{
            ...RAINBOWS_POSITION.invite_code.rainbowPixel,
          }}
          exit={{
            ...RAINBOWS_POSITION[screen].rainbowPixel,
          }}
        />
        <Box
          as={motion.img}
          src={rainbowWhite}
          position="absolute"
          style={{
            width: '171px',
          }}
          initial={{
            ...RAINBOWS_POSITION[screen].rainbowWhite,
          }}
          animate={{
            ...RAINBOWS_POSITION.invite_code.rainbowWhite,
          }}
          exit={{
            ...RAINBOWS_POSITION[screen].rainbowWhite,
          }}
        />
        <Box
          as={motion.img}
          src={rainbowOg}
          position="absolute"
          style={{
            height: '130px',
          }}
          initial={{
            ...RAINBOWS_POSITION[screen].rainbowOg,
          }}
          animate={{
            ...RAINBOWS_POSITION.invite_code.rainbowOg,
          }}
          exit={{
            ...RAINBOWS_POSITION[screen].rainbowOg,
          }}
        />
        <Box
          as={motion.img}
          src={rainbowLight}
          position="absolute"
          style={{
            width: '170px',
          }}
          initial={{
            ...RAINBOWS_POSITION[screen].rainbowLight,
          }}
          animate={{
            ...RAINBOWS_POSITION.invite_code.rainbowLight,
          }}
          exit={{
            ...RAINBOWS_POSITION[screen].rainbowLight,
          }}
        />
        <Box
          as={motion.img}
          src={rainbowNeon}
          position="absolute"
          style={{
            width: '155px',
          }}
          initial={{
            ...RAINBOWS_POSITION[screen].rainbowNeon,
          }}
          animate={{
            ...RAINBOWS_POSITION.invite_code.rainbowNeon,
          }}
          exit={{
            ...RAINBOWS_POSITION[screen].rainbowNeon,
          }}
        />
      </Box>
      {children}
    </Box>
  );
}
