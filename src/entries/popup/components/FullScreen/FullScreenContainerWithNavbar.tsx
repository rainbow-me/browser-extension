import React from 'react';

import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box } from '~/design-system';

export function FullScreenContainerWithNavbar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      borderColor="separatorSecondary"
      borderWidth="1px"
      background="surfaceSecondary"
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding="20px"
      style={{
        paddingTop: '56px',
        minHeight: POPUP_DIMENSIONS.height,
      }}
    >
      {children}
    </Box>
  );
}
