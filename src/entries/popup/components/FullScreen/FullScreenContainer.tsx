import React from 'react';

import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box } from '~/design-system';

export function FullScreenContainer({
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
      position="absolute"
      style={{
        paddingTop: '56px',
        minHeight: POPUP_DIMENSIONS.height,
        minWidth: POPUP_DIMENSIONS.width,
        overflowX: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}
