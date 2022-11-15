import React from 'react';

import { Box, Stack } from '~/design-system';

interface MenuProps {
  children: React.ReactNode;
  header?: string;
  description?: string;
}

const Menu = ({ children }: MenuProps) => {
  return (
    <Box
      background="surfaceSecondaryElevated"
      borderRadius="16px"
      boxShadow="12px"
      width="full"
    >
      <Stack
      // TODO: add separator
      >
        {children}
      </Stack>
    </Box>
  );
};

export { Menu };
