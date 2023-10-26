import React, { useCallback, useState } from 'react';

import { useCustomRPCsStore } from '~/core/state/customRPC';
import { Box, Button, Inline, Stack, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';

import { maskInput } from '../../components/InputMask/utils';

export function SettingsNetworksCustomRPC() {
  const { customRPCs, setCustomRPC } = useCustomRPCsStore();
  const [rpcUrl, setRpcUrl] = useState<string>();
  const [chainId, setChainId] = useState<number>();
  const [name, setName] = useState<string>();
  const [symbol, setSymbol] = useState<string>();
  const [explorerUrl, setExplorerUrl] = useState<string>();

  const onInputChange = useCallback(
    <T extends string | number>(
      input: React.ChangeEvent<HTMLInputElement>,
      type: 'string' | 'number',
      setData: (a: T | undefined) => void,
    ) => {
      const value = input.target.value;

      if (type === 'number') {
        console.log('-- value', value);
        const maskedValue = maskInput({ inputValue: value, decimals: 0 });
        setData(maskedValue ? (Number(maskedValue) as T) : undefined);
      } else {
        setData(value as T);
      }
    },
    [],
  );

  const addCustomRpc = useCallback(() => {
    if (rpcUrl && chainId && name && symbol) {
      const customRpc = {
        rpcUrl,
        chainId,
        name,
        symbol,
        explorerUrl,
      };
      setCustomRPC({ customRPC: customRpc });
    }
  }, [chainId, explorerUrl, name, rpcUrl, setCustomRPC, symbol]);

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
              onChange={(t) => onInputChange<string>(t, 'string', setRpcUrl)}
              height="32px"
              placeholder="Url"
              variant="surface"
              value={rpcUrl}
            />
            <Input
              onChange={(t) => onInputChange<number>(t, 'number', setChainId)}
              height="32px"
              placeholder="ChainId"
              variant="surface"
              value={chainId}
            />
            <Input
              onChange={(t) => onInputChange<string>(t, 'string', setName)}
              height="32px"
              placeholder="name"
              variant="surface"
              value={name}
            />
            <Input
              onChange={(t) => onInputChange<string>(t, 'string', setSymbol)}
              height="32px"
              placeholder="Symbol"
              variant="surface"
              value={symbol}
            />
            <Input
              onChange={(t) =>
                onInputChange<string>(t, 'string', setExplorerUrl)
              }
              height="32px"
              placeholder="Explorer url"
              variant="surface"
              value={explorerUrl}
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
