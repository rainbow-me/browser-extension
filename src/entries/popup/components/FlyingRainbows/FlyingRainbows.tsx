import { TargetAndTransition, motion } from 'framer-motion';
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
  [key in
    | 'rainbowPixel'
    | 'rainbowWhite'
    | 'rainbowOg'
    | 'rainbowLight'
    | 'rainbowNeon']: {
    [key in FlyingRainbowsScreen]: {
      left?: string;
      right?: string;
      top?: string;
      bottom?: string;
    };
  };
} = {
  rainbowPixel: {
    unlock: {
      right: '0px',
      top: '0px',
    },
    invite_code: {
      right: '-15.64px',
      top: '-79px',
    },
  },
  rainbowWhite: {
    unlock: {
      left: '0px',
      top: '0px',
    },
    invite_code: {
      left: '-58.66px',
      top: '-45.44px',
    },
  },
  rainbowOg: {
    unlock: {
      left: '0px',
      top: '362px',
    },
    invite_code: {
      left: '-30px',
      top: '392px',
    },
  },
  rainbowLight: {
    unlock: {
      left: '100px',
      top: '370px',
    },
    invite_code: {
      left: '4.89px',
      top: '509.26px',
    },
  },
  rainbowNeon: {
    unlock: {
      right: '-5px',
      bottom: '0px',
    },
    invite_code: {
      right: '-68.93px',
      bottom: '-9.36px',
    },
  },
};

export const RAINBOWS_ANIMATION: {
  [key in
    | 'rainbowPixel'
    | 'rainbowWhite'
    | 'rainbowOg'
    | 'rainbowLight'
    | 'rainbowNeon']: {
    [key in FlyingRainbowsScreen]: {
      initial?: TargetAndTransition;
      animate?: TargetAndTransition;
      exit?: TargetAndTransition;
    };
  };
} = {
  rainbowPixel: {
    unlock: {},
    invite_code: {},
  },
  rainbowWhite: {
    unlock: {},
    invite_code: {},
  },
  rainbowOg: {
    unlock: {},
    invite_code: {},
  },
  rainbowLight: {
    unlock: {},
    invite_code: {},
  },
  rainbowNeon: {
    unlock: {},
    invite_code: {},
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
            ...RAINBOWS_POSITION.rainbowPixel[screen],
          }}
          animate={{
            ...RAINBOWS_POSITION.rainbowPixel.invite_code,
          }}
          exit={{
            ...RAINBOWS_POSITION.rainbowPixel[screen],
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
            ...RAINBOWS_POSITION.rainbowWhite[screen],
          }}
          animate={{
            ...RAINBOWS_POSITION.rainbowWhite.invite_code,
          }}
          exit={{
            ...RAINBOWS_POSITION.rainbowWhite[screen],
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
            ...RAINBOWS_POSITION.rainbowOg[screen],
          }}
          animate={{
            ...RAINBOWS_POSITION.rainbowOg.invite_code,
          }}
          exit={{
            ...RAINBOWS_POSITION.rainbowOg[screen],
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
            ...RAINBOWS_POSITION.rainbowLight[screen],
          }}
          animate={{
            ...RAINBOWS_POSITION.rainbowLight.invite_code,
          }}
          exit={{
            ...RAINBOWS_POSITION.rainbowLight[screen],
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
            ...RAINBOWS_POSITION.rainbowNeon[screen],
          }}
          animate={{
            ...RAINBOWS_POSITION.rainbowNeon.invite_code,
          }}
          exit={{
            ...RAINBOWS_POSITION.rainbowNeon[screen],
          }}
        />
      </Box>
      {children}
    </Box>
  );
}
