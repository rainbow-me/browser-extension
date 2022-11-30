import React from 'react';
import { Outlet } from 'react-router-dom';

import { Box } from '~/design-system';

export function Privacy() {
  return (
    <Box
      background="surfaceSecondary"
      borderWidth="1px"
      borderColor="separatorTertiary"
      style={{ minHeight: '100%' }}
    >
      <Outlet />
    </Box>
  );
}
