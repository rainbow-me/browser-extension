import React, { forwardRef } from 'react';

import { Box, Separator, Stack } from '~/design-system';
import { BoxStyles } from '~/design-system/styles/core.css';

interface MenuProps {
  children: React.ReactNode;
  header?: string;
  description?: string;
  paddingVertical?: BoxStyles['paddingVertical'];
}

const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(
  { children, paddingVertical },
  ref,
) {
  return (
    <Box
      ref={ref}
      background="surfaceSecondaryElevated"
      borderRadius="16px"
      boxShadow="12px"
      width="full"
      paddingVertical={paddingVertical}
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
});

export { Menu };
