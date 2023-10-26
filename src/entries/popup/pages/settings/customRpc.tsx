import React, { useCallback, useState } from 'react';

import { useCustomRPCsStore } from '~/core/state/customRPC';
import { Box, Button, Inline, Stack, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';

import { maskInput } from '../../components/InputMask/utils';

export function SettingsNetworksCustomRPC() {
  const { customRPCs, addCustomRPC } = useCustomRPCsStore();
  const [customRPC, setCustomRPC] = useState<{
    rpcUrl?: string;
    chainId?: number;
    name?: string;
    symbol?: string;
    explorerUrl?: string;
  }>({});

  const onInputChange = useCallback(
    <T extends string | number>(
      input: React.ChangeEvent<HTMLInputElement>,
      type: 'string' | 'number',
      data: 'rpcUrl' | 'chainId' | 'name' | 'symbol' | 'explorerUrl',
    ) => {
      const value = input.target.value;

      if (type === 'number') {
        const maskedValue = maskInput({ inputValue: value, decimals: 0 });
        setCustomRPC((prev) => ({
          ...prev,
          [data]: maskedValue ? (Number(maskedValue) as T) : undefined,
        }));
      } else {
        setCustomRPC((prev) => ({
          ...prev,
          [data]: value as T,
        }));
      }
    },
    [],
  );

  console.log('- customRPC.chainId', customRPC.chainId);

  const addCustomRpc = useCallback(() => {
    const { rpcUrl, chainId, name, symbol } = customRPC;
    if (rpcUrl && chainId && name && symbol) {
      addCustomRPC({
        customRPC: { ...customRPC, rpcUrl, chainId, name, symbol },
      });
    }
  }, [addCustomRPC, customRPC]);

  return (
    <Box paddingHorizontal="20px">
      <Stack space="20px">
        <Box>
          {Object.values(customRPCs).map((customRPC, i) => (
            <Box
              key={i}
              background="surfaceSecondaryElevated"
              borderRadius="16px"
              boxShadow="12px"
              width="full"
              padding="16px"
            >
              <Text size="14pt" weight="bold" align="center">
                {JSON.stringify(customRPC)}
              </Text>
            </Box>
          ))}
        </Box>

        <Box
          background="surfaceSecondaryElevated"
          borderRadius="16px"
          boxShadow="12px"
          width="full"
          padding="16px"
        >
          <Stack space="8px">
            <Input
              onChange={(t) => onInputChange<string>(t, 'string', 'rpcUrl')}
              height="32px"
              placeholder="Url"
              variant="surface"
              value={customRPC.rpcUrl}
            />
            <Input
              onChange={(t) => onInputChange<number>(t, 'number', 'chainId')}
              height="32px"
              placeholder="ChainId"
              variant="surface"
              value={customRPC.chainId || ''}
            />
            <Input
              onChange={(t) => onInputChange<string>(t, 'string', 'name')}
              height="32px"
              placeholder="name"
              variant="surface"
              value={customRPC.name}
            />
            <Input
              onChange={(t) => onInputChange<string>(t, 'string', 'symbol')}
              height="32px"
              placeholder="Symbol"
              variant="surface"
              value={customRPC.symbol}
            />
            <Input
              onChange={(t) =>
                onInputChange<string>(t, 'string', 'explorerUrl')
              }
              height="32px"
              placeholder="Explorer url"
              variant="surface"
              value={customRPC.explorerUrl}
            />
            <Inline alignHorizontal="right">
              <Button
                onClick={addCustomRpc}
                color="accent"
                height="36px"
                variant="raised"
              >
                Add
              </Button>
            </Inline>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
