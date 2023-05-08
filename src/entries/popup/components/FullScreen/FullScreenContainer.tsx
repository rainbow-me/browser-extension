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
      // borderColor="separatorSecondary"
      // borderWidth="1px"
      // background="green"
      display="flex"
      flexDirection="column"
      alignItems="center"
      paddingHorizontal="16px"
      paddingVertical="20px"
      // position="absolute"
      style={{
        // paddingTop: paddingTop ?? '56px',
        minHeight: POPUP_DIMENSIONS.height - 65,
        // minWidth: POPUP_DIMENSIONS.width,
        overflowX: 'hidden',
        height: '100%',
        // position: 'absolute',
      }}
    >
      {children}
    </Box>
  );
}
