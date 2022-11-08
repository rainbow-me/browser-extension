import React from 'react';

import { Box, Inset, Stack } from '~/design-system';

interface MenuContainerProps {
  children: React.ReactNode;
  testID?: string;
}
const MenuContainer = ({ children, testID }: MenuContainerProps) => {
  return (
    // ios scroll fix
    <Inset>
      <Box paddingHorizontal="10px" testId={testID}>
        <Stack space="36px">{children}</Stack>
      </Box>
    </Inset>
  );
};

export { MenuContainer };
