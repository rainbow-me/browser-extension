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
    rainbowPixel: {},
    rainbowWhite: {},
    rainbowOg: {},
    rainbowLight: {},
    rainbowNeon: {},
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
        <img
          src={rainbowPixel}
          width="150"
          height="150"
          style={{
            position: 'absolute',
            ...RAINBOWS_POSITION[screen].rainbowPixel,
          }}
        />
        <img
          src={rainbowWhite}
          width="171"
          style={{
            position: 'absolute',
            ...RAINBOWS_POSITION[screen].rainbowWhite,
          }}
        />
        <img
          src={rainbowOg}
          height="130"
          style={{
            position: 'absolute',
            ...RAINBOWS_POSITION[screen].rainbowOg,
          }}
        />
        <img
          src={rainbowLight}
          width="170"
          style={{
            position: 'absolute',
            ...RAINBOWS_POSITION[screen].rainbowLight,
          }}
        />
        <img
          src={rainbowNeon}
          width="155"
          style={{
            position: 'absolute',
            ...RAINBOWS_POSITION[screen].rainbowNeon,
          }}
        />
      </Box>
      {children}
    </Box>
  );
}
