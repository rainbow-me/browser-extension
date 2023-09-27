import React from 'react';

import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box } from '~/design-system';
import { BackgroundColor } from '~/design-system/styles/designTokens';

import { NAVBAR_HEIGHT } from '../Navbar/Navbar';

export function FullScreenContainer({
  children,
  background,
}: {
  children: React.ReactNode;
  background?: BackgroundColor;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      paddingHorizontal="20px"
      background={background}
      style={{
        minHeight: POPUP_DIMENSIONS.height - NAVBAR_HEIGHT,
        height: '100%',
      }}
    >
      {children}
    </Box>
  );
}
