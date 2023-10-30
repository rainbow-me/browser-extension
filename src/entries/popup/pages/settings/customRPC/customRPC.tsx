import React from 'react';
import { useLocation } from 'react-router';

import { CustomRPC, useCustomRPCsStore } from '~/core/state/customRPC';
import { Box, Button, Inline, Stack, Text } from '~/design-system';
import { Checkbox } from '~/entries/popup/components/Checkbox/Checkbox';

export function CustomRPC() {
  const { state } = useLocation();
  const { setActiveRPC, customChains, removeCustomRPC } = useCustomRPCsStore();
  const chain = customChains[state?.chainId as number];

  return (
    <Box paddingHorizontal="20px">
      <Stack space="16px">
        {chain?.rpcs?.map((customRPC, i) => {
          return (
            <Box
              background="surfaceSecondaryElevated"
              borderRadius="16px"
              boxShadow="12px"
              width="full"
              padding="16px"
              key={i}
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
                <Inline alignHorizontal="justify">
                  <Text
                    align="center"
                    weight="semibold"
                    size="12pt"
                    color="labelSecondary"
                  >
                    {'Active'}
                  </Text>
                  <Checkbox
                    borderColor="accent"
                    onClick={() =>
                      setActiveRPC({
                        rpcUrl: customRPC.rpcUrl,
                        chainId: customRPC.chainId,
                      })
                    }
                    selected={chain.activeRpcId === customRPC.rpcUrl}
                  />
                </Inline>
                <Inline alignHorizontal="right">
                  <Button
                    onClick={() =>
                      removeCustomRPC({ rpcUrl: customRPC.rpcUrl })
                    }
                    color="accent"
                    height="36px"
                    variant="raised"
                  >
                    Remove
                  </Button>
                </Inline>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
