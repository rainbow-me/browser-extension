import React from 'react';
import { Storage } from '~/core/storage';
import { Box, Text } from '~/design-system';

export function ClearStorage() {
  return (
    <Box
      as="button"
      background="accent"
      onClick={Storage.clear}
      padding="16px"
      style={{ borderRadius: 999 }}
    >
      <Text color="labelSecondary" size="15pt" weight="bold">
        CLEAR STORAGE
      </Text>
    </Box>
  );
}
