import React from 'react';

import { Box, Stack } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';

export function SettingsNetworksCustomRPC() {
  return (
    <Box paddingHorizontal="20px">
      <Box
        background="surfaceSecondaryElevated"
        borderRadius="16px"
        boxShadow="12px"
        width="full"
        padding="16px"
      >
        <Stack space="8px">
          <Input height="32px" placeholder="Url" variant="surface" />
          <Input height="32px" placeholder="ChainId" variant="surface" />
          <Input height="32px" placeholder="name" variant="surface" />
          <Input height="32px" placeholder="Symbol" variant="surface" />
          <Input height="32px" placeholder="Explorer" variant="surface" />
          <Input height="32px" placeholder="Explorer name" variant="surface" />
          <Input
            height="32px"
            placeholder="Native Asset Address"
            variant="surface"
          />
        </Stack>
      </Box>
    </Box>
  );
}
