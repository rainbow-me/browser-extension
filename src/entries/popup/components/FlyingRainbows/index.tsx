import * as React from 'react';

import rainbowLight from 'static/assets/rainbow/light-rainbow.png';
import rainbowNeon from 'static/assets/rainbow/neon-rainbow.png';
import rainbowOg from 'static/assets/rainbow/og-rainbow.png';
import rainbowPixel from 'static/assets/rainbow/pixel-rainbow.png';
import rainbowWhite from 'static/assets/rainbow/white-rainbow.png';
import { Box } from '~/design-system';

import { FullScreenBackground } from '../../components/FullScreen/FullScreenBackground';

export function FlyingRainbows({ children }: { children: React.ReactNode }) {
  return (
    <FullScreenBackground>
      <Box
        borderColor="separatorSecondary"
        borderWidth="1px"
        background="surfaceSecondary"
        display="flex"
        flexDirection="column"
        alignItems="center"
        borderRadius="32px"
        padding="24px"
        style={{
          width: 360,
          height: 600,
          alignSelf: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          style={{
            background: 'transparent',
            position: 'absolute',
            top: '0px',
            left: '0px',
            right: '0px',
            bottom: '0px',
          }}
        >
          <img
            src={rainbowPixel}
            width="150"
            height="150"
            style={{
              position: 'absolute',
              right: '0px',
              top: '0px',
            }}
          />
          <img
            src={rainbowWhite}
            width="171"
            style={{
              position: 'absolute',
              left: '0px',
              top: '0px',
            }}
          />
          <img
            src={rainbowOg}
            height="130"
            style={{
              position: 'absolute',
              left: '0px',
              top: '360px',
            }}
          />
          <img
            src={rainbowLight}
            width="170"
            style={{
              position: 'absolute',
              left: '100px',
              top: '370px',
            }}
          />
          <img
            src={rainbowNeon}
            width="155"
            style={{
              position: 'absolute',
              right: '-5px',
              bottom: '0px',
            }}
          />
        </Box>
        {children}
      </Box>
    </FullScreenBackground>
  );
}
