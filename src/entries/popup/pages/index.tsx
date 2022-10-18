import React from 'react';
import { Box, Text } from '~/design-system';
import { InjectToggle } from '../components/InjectToggle';

export function Index() {
  return (
    <Box display="flex" flexDirection="column" gap="24px" padding="20px">
      <Text as="h1" size="20pt" weight="bold">
        Rainbow
      </Text>
      <InjectToggle />
    </Box>
  );
}
