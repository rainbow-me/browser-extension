import { Transition, motion, useAnimationControls } from 'framer-motion';
import * as React from 'react';

import rainbowLight from 'static/assets/rainbow/light-rainbow.png';
import rainbowNeon from 'static/assets/rainbow/neon-rainbow.png';
import rainbowOg from 'static/assets/rainbow/og-rainbow.png';
import rainbowPixel from 'static/assets/rainbow/pixel-rainbow.png';
import rainbowWhite from 'static/assets/rainbow/white-rainbow.png';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box } from '~/design-system';

import { useIsFullScreen } from '../../hooks/useIsFullScreen';
import usePrevious from '../../hooks/usePrevious';

type FlyingRainbowsScreen = 'unlock' | 'invite_code';
type RainbowType =
  | 'rainbowPixel'
  | 'rainbowWhite'
  | 'rainbowOg'
  | 'rainbowLight'
  | 'rainbowNeon';

const RAINBOWS_POSITION: {
  [key in RainbowType]: {
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
      left: '207.36px',
      top: '-77px',
    },
    invite_code: {
      left: '223px',
      top: '-156px',
    },
  },
  rainbowWhite: {
    unlock: {
      left: '-33.98px',
      top: '-4.21px',
    },
    invite_code: {
      left: '-92.64px',
      top: '-49.64px',
    },
  },
  rainbowOg: {
    unlock: {
      left: '-46.1px',
      top: '378.17px',
    },
    invite_code: {
      left: '-76.1px',
      top: '348.17px',
    },
  },
  rainbowLight: {
    unlock: {
      left: '120.92px',
      top: '385.78px',
    },
    invite_code: {
      left: '16.03px',
      top: '525.03px',
    },
  },
  rainbowNeon: {
    unlock: {
      left: '234.12px',
      top: '549.4px',
    },
    invite_code: {
      left: '298.05px',
      top: '540.05px',
    },
  },
};

const RAINBOW_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 15,
  mass: 1,
};

export function FlyingRainbows({
  children,
  screen = 'unlock',
}: {
  children: React.ReactNode;
  screen?: FlyingRainbowsScreen;
}) {
  const isFullscreen = useIsFullScreen();
  const rainbowPixelControls = useAnimationControls();
  const rainbowWhiteControls = useAnimationControls();
  const rainbowOgControls = useAnimationControls();
  const rainbowLightControls = useAnimationControls();
  const rainbowNeonControls = useAnimationControls();
  const prevScreen = usePrevious(screen);

  React.useEffect(() => {
    if (prevScreen === 'invite_code' && screen === 'unlock') {
      rainbowPixelControls.start({
        ...RAINBOWS_POSITION.rainbowPixel.unlock,
      });
      rainbowWhiteControls.start({
        ...RAINBOWS_POSITION.rainbowWhite.unlock,
      });
      rainbowOgControls.start({
        ...RAINBOWS_POSITION.rainbowOg.unlock,
      });
      rainbowLightControls.start({
        ...RAINBOWS_POSITION.rainbowLight.unlock,
      });
      rainbowNeonControls.start({
        ...RAINBOWS_POSITION.rainbowNeon.unlock,
      });
    } else if (prevScreen === 'unlock' && screen === 'invite_code') {
      rainbowPixelControls.start({
        ...RAINBOWS_POSITION.rainbowPixel.invite_code,
      });
      rainbowWhiteControls.start({
        ...RAINBOWS_POSITION.rainbowWhite.invite_code,
      });
      rainbowOgControls.start({
        ...RAINBOWS_POSITION.rainbowOg.invite_code,
      });
      rainbowLightControls.start({
        ...RAINBOWS_POSITION.rainbowLight.invite_code,
      });
      rainbowNeonControls.start({
        ...RAINBOWS_POSITION.rainbowNeon.invite_code,
      });
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
          src={rainbowWhite}
          position="absolute"
          style={{
            width: '171.34px',
            height: '171.34px',
            rotate: '150deg',
          }}
          initial={RAINBOWS_POSITION.rainbowWhite[screen]}
          animate={rainbowWhiteControls}
          transition={RAINBOW_TRANSITION}
        />
        <Box
          as={motion.img}
          src={rainbowPixel}
          position="absolute"
          style={{
            width: '225.17px',
            height: '225.17px',
          }}
          initial={RAINBOWS_POSITION.rainbowPixel[screen]}
          animate={rainbowPixelControls}
          transition={RAINBOW_TRANSITION}
        />
        <Box
          as={motion.img}
          src={rainbowOg}
          position="absolute"
          style={{
            height: '95.58px',
            width: '95.58px',
            rotate: '-33.07deg',
          }}
          initial={RAINBOWS_POSITION.rainbowOg[screen]}
          animate={rainbowOgControls}
          transition={RAINBOW_TRANSITION}
        />
        <Box
          as={motion.img}
          src={rainbowLight}
          position="absolute"
          style={{
            width: '142.69px',
            height: '142.69px',
            rotate: '75deg',
          }}
          initial={RAINBOWS_POSITION.rainbowLight[screen]}
          animate={rainbowLightControls}
          transition={RAINBOW_TRANSITION}
        />
        <Box
          as={motion.img}
          src={rainbowNeon}
          position="absolute"
          style={{
            width: '112.58px',
            height: '112.58px',
            rotate: '34.75deg',
          }}
          initial={RAINBOWS_POSITION.rainbowNeon[screen]}
          animate={rainbowNeonControls}
          transition={RAINBOW_TRANSITION}
        />
      </Box>
      {children}
    </Box>
  );
}
