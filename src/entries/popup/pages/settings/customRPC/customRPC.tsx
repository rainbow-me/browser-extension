import React from 'react';
import { useLocation } from 'react-router';

import { CustomRPC } from '~/core/state/customRPC';
import { Box, Inline, Stack, Text } from '~/design-system';

export function CustomRPC() {
  const { state } = useLocation();
  const customRPC = state?.customRPC as CustomRPC;

  return (
    <Box paddingHorizontal="20px">
      <Box
        background="surfaceSecondaryElevated"
        borderRadius="16px"
        boxShadow="12px"
        width="full"
        padding="16px"
      >
        <Stack space="10px">
          {Object.keys(customRPC).map((key, i) => (
            <Box key={i}>
              <Inline space="4px">
                <Text size="14pt" weight="bold" align="center">
                  {`${key}:`}
                </Text>
                <Text size="14pt" weight="bold" align="center">
                  {`${String(customRPC[key as keyof typeof customRPC])}`}
                </Text>
              </Inline>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
