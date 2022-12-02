import React from 'react';

import { Box, Separator, Stack } from '~/design-system';

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
        separator={
          <Box paddingHorizontal="16px">
            <Separator color="separatorTertiary" />
          </Box>
        }
      >
        {children}
      </Stack>
    </Box>
  );
};

export { Menu };
