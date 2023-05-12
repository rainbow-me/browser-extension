import React from 'react';

import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box } from '~/design-system';

import { NAVBAR_HEIGHT } from '../Navbar/Navbar';

export function FullScreenContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      paddingHorizontal="20px"
      style={{
        minHeight: POPUP_DIMENSIONS.height - NAVBAR_HEIGHT,
        height: '100%',
      }}
    >
      {children}
    </Box>
  );
}
