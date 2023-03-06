import React from 'react';

import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box } from '~/design-system';

import { useIsFullScreen } from '../../hooks/useIsFullScreen';

import { Blur } from './Blur';

export function FullScreenBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const isFullscreen = useIsFullScreen();
  if (!isFullscreen) return children as JSX.Element;
  return (
    <Box
      position="absolute"
      display="flex"
      width="full"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      height="full"
      background="surfacePrimary"
    >
      <Blur />
      <Box
        style={{
          position: 'absolute',
          top: '0px',
          left: '0px',
          width: '100vw',
          height: '100vh',
          backgroundImage: 'url(assets/bg/noise.png)',
          opacity: 0.35,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'soft-light',
        }}
        background="surfacePrimary"
      />
      <Box
        borderRadius="32px"
        style={{
          width: POPUP_DIMENSIONS.width,
          height: POPUP_DIMENSIONS.height,
          position: 'relative',
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
