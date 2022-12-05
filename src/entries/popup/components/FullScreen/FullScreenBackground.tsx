import React from 'react';

import { Box } from '~/design-system';

import { Blur } from './Blur';

export function FullScreenBackground({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <div
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
      />
      {children}
    </Box>
  );
}
