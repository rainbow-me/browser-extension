import React from 'react';

import { Box, Stack, Text } from '~/design-system';

interface MenuProps {
  children: React.ReactNode;
  header?: string;
  description?: string;
}

const Menu = ({ children, description, header }: MenuProps) => {
  return (
    <>
      {!!header && (
        <Box paddingBottom="12px" paddingHorizontal="16px">
          <Text color="label" size="12pt" weight="regular">
            {header}
          </Text>
        </Box>
      )}
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
      {!!description && (
        <Box paddingHorizontal="16px" paddingTop="16px">
          <Text color="labelSecondary" size="14pt" weight="regular">
            {description}
          </Text>
        </Box>
      )}
    </>
  );
};

export { Menu };
