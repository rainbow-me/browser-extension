import React from 'react';

import { Box, Inline, Stack, Text } from '~/design-system';
import { Prompt } from '~/design-system/components/Prompt/Prompt';

export const CustomGasSheet = () => {
  return (
    <Prompt show={true} padding="16px">
      <Box paddingVertical="27px">
        <Text color="label" align="center" size="14pt" weight="heavy">
          Gwei Settings
        </Text>
      </Box>
      <Stack space="12px">
        <Box paddingBottom="12px">
          <Box style={{ height: 32 }} paddingLeft="20px" paddingRight="16px">
            <Stack space="12px">
              <Inline height="full" alignHorizontal="right">
                <Text color="green" align="center" size="14pt" weight="bold">
                  Rising
                </Text>
              </Inline>
              <Inline height="full" alignHorizontal="justify">
                <Text color="label" align="center" size="14pt" weight="bold">
                  Current base fee
                </Text>
                <Text color="label" align="center" size="14pt" weight="bold">
                  Max base fee
                </Text>
              </Inline>
            </Stack>
          </Box>
        </Box>
        <Box style={{ height: 32 }} paddingLeft="20px" paddingRight="16px">
          <Inline
            height="full"
            alignHorizontal="justify"
            alignVertical="center"
          >
            <Text color="label" align="center" size="14pt" weight="bold">
              Max base fee
            </Text>
            <Text color="label" align="center" size="14pt" weight="bold">
              Max base fee
            </Text>
          </Inline>
        </Box>
        <Box style={{ height: 32 }} paddingLeft="20px" paddingRight="16px">
          <Inline
            height="full"
            alignHorizontal="justify"
            alignVertical="center"
          >
            <Text color="label" align="center" size="14pt" weight="bold">
              Miner tip
            </Text>
            <Text color="label" align="center" size="14pt" weight="bold">
              Max base fee
            </Text>
          </Inline>
        </Box>
        <Box style={{ height: 32 }} paddingLeft="20px" paddingRight="16px">
          <Inline
            height="full"
            alignHorizontal="justify"
            alignVertical="center"
          >
            <Text color="label" align="center" size="14pt" weight="bold">
              Max transaction fee
            </Text>
            <Text color="label" align="center" size="14pt" weight="bold">
              Max base fee
            </Text>
          </Inline>
        </Box>
      </Stack>
    </Prompt>
  );
};
