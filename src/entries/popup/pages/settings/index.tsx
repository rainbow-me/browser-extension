import React from 'react';
import { Outlet } from 'react-router-dom';

import { Box } from '~/design-system';

export function Settings() {
  return (
    <Box
      background="surfaceSecondary"
      borderWidth="1px"
      borderColor="separatorTertiary"
      height="full"
    >
      <Outlet />
    </Box>
  );
}
