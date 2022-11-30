import React from 'react';

import { Box, Stack } from '~/design-system';

interface MenuContainerProps {
  children: React.ReactNode;
  testId?: string;
}
const MenuContainer = ({ children, testId }: MenuContainerProps) => {
  return (
    <Box testId={testId} paddingBottom="20px">
      <Stack space="20px">{children}</Stack>
    </Box>
  );
};

export { MenuContainer };
