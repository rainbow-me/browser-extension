import React from 'react';

import { Box, Inline, Text } from '~/design-system';

export const ShortcutHint = ({ hint }: { hint: string }) => {
  return (
    <Box
      background="fillSecondary"
      padding="4px"
      borderRadius="3px"
      boxShadow="1px"
      style={{ width: '18px', height: '18px' }}
    >
      <Inline alignHorizontal="center" alignVertical="center">
        <Text size="12pt" color="labelSecondary" weight="semibold">
          {hint}
        </Text>
      </Inline>
    </Box>
  );
};
