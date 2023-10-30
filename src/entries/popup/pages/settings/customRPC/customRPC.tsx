import React, { useCallback, useState } from 'react';
import { useLocation } from 'react-router';

import { CustomRPC, useCustomRPCsStore } from '~/core/state/customRPC';
import { Box, Button, Inline, Stack, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { Checkbox } from '~/entries/popup/components/Checkbox/Checkbox';
import { maskInput } from '~/entries/popup/components/InputMask/utils';

export function CustomRPC() {
  const { state } = useLocation();
  const { setActiveRPC, customChains, removeCustomRPC } = useCustomRPCsStore();
  const chain = customChains[state?.chainId as number];

  const [asset, setAsset] = useState<{
    address: string;
    decimals: number;
    symbol: string;
  }>({
    address: '',
    decimals: 18,
    symbol: '',
  });

  const onInputChange = useCallback(
    <T extends string | number | boolean>(
      value: string | boolean,
      type: 'string' | 'number' | 'boolean',
      data: 'address' | 'decimals' | 'symbol',
    ) => {
      if (type === 'number' && typeof value === 'string') {
        const maskedValue = maskInput({ inputValue: value, decimals: 0 });
        setAsset((prev) => ({
          ...prev,
          [data]: maskedValue ? (Number(maskedValue) as T) : undefined,
        }));
      } else {
        setAsset((prev) => ({
          ...prev,
          [data]: value as T,
        }));
      }
    },
    [],
  );

  return (
    <Box paddingHorizontal="20px">
      <Stack space="24px">
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
                          {`${String(
                            customRPC[key as keyof typeof customRPC],
                          )}`}
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
                      selected={chain.activeRpcUrl === customRPC.rpcUrl}
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
        <Box
          background="surfaceSecondaryElevated"
          borderRadius="16px"
          boxShadow="12px"
          width="full"
          padding="16px"
        >
          <Stack space="8px">
            <Input
              onChange={(t) =>
                onInputChange<string>(t.target.value, 'string', 'address')
              }
              height="32px"
              placeholder="Address"
              variant="surface"
              value={asset.address}
              // onBlur={onRpcUrlBlur}
              // borderColor={validations.rpcUrl ? 'accent' : 'red'}
            />
            <Input
              onChange={(t) =>
                onInputChange<number>(t.target.value, 'number', 'decimals')
              }
              height="32px"
              placeholder="Decimals"
              variant="surface"
              value={asset.decimals}
              // onBlur={onChainIdBlur}
              // borderColor={validations.chainId ? 'accent' : 'red'}
            />
            <Input
              onChange={(t) =>
                onInputChange<string>(t.target.value, 'string', 'symbol')
              }
              height="32px"
              placeholder="name"
              variant="surface"
              value={asset.symbol}
              // onBlur={onNameBlur}
              // borderColor={validations.name ? 'accent' : 'red'}
            />

            <Inline alignHorizontal="right">
              <Button
                // onClick={addCustomRpc}
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
