import React from 'react';

import { Box } from '~/design-system';

import { Blur } from './Blur';

export function FullScreenBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const isFullscreen = window.innerHeight >= 600 && window.innerWidth > 360;
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
          backgroundImage: 'url(static/images/bg/noise.png)',
          opacity: 0.35,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'soft-light',
        }}
        background="surfacePrimary"
      />
      <Box
        borderRadius="32px"
        style={{
          width: 360,
          height: 600,
          position: 'relative',
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
