import React from 'react';

import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box } from '~/design-system';

import { useIsFullScreen } from '../../hooks/useIsFullScreen';

export function FullScreenBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentTheme } = useCurrentThemeStore();
  const isFullscreen = useIsFullScreen();

  if (!isFullscreen) return children as JSX.Element;

  return (
    <Box
      position="absolute"
      display="flex"
      width="full"
      height="full"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      style={{
        backgroundColor: currentTheme === 'dark' ? '#131314' : '#E7E8E9',
        width: '100vw',
        height: '100vh',
      }}
    >
      <Box
        width="full"
        height="full"
        style={{
          position: 'absolute',
          top: '0px',
          backgroundImage: 'url(assets/bg/noise.png)',
          backgroundSize: '50%',
          backgroundRepeat: 'repeat',
          opacity: 0.25,
          mixBlendMode: 'overlay',
          left: '0px',
          width: '100vw',
          height: '100vh',
        }}
      />
      <Box
        borderRadius="32px"
        background="surfacePrimaryElevated"
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
