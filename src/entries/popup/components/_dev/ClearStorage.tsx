import React from 'react';

import { LocalStorage } from '~/core/storage';
import { Box, Text } from '~/design-system';

export function ClearStorage() {
  return (
    <Box
      as="button"
      background="accent"
      boxShadow="24px accent"
      onClick={LocalStorage.clear}
      padding="16px"
      style={{ borderRadius: 999 }}
    >
      <Text color="label" size="16pt" weight="bold">
        CLEAR STORAGE
      </Text>
    </Box>
  );
}
