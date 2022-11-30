import React from 'react';

import { Box, Stack } from '~/design-system';

interface MenuContainerProps {
  children: React.ReactNode;
  testID?: string;
}
const MenuContainer = ({ children, testID }: MenuContainerProps) => {
  return (
    <Box testId={testID} paddingBottom="20px">
      <Stack space="20px">{children}</Stack>
    </Box>
  );
};

export { MenuContainer };
