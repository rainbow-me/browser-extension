import React from 'react';

import { Box, Text } from '~/design-system';

export const ShortcutHint = ({ hint }: { hint: string }) => {
  return (
    <Box
      background="fillSecondary"
      padding="4px"
      borderRadius="3px"
      boxShadow="1px"
    >
      <Text size="12pt" color="labelSecondary" weight="semibold">
        {hint}
      </Text>
    </Box>
  );
};
