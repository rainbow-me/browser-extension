import React from 'react';

import { Box, Text } from '~/design-system';

const LabelPill = ({ label }: { label: string }) => (
  <Box
    background="surfacePrimaryElevatedSecondary"
    borderRadius="round"
    padding="8px"
  >
    <Text size="12pt" weight="semibold" color="labelQuaternary">
      {label}
    </Text>
  </Box>
);

export { LabelPill };
