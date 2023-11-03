import { isValidAddress } from '@ethereumjs/util';
import React, { useCallback, useState } from 'react';
import { useLocation } from 'react-router';
import { Address } from 'wagmi';

import { CustomRPC, useCustomRPCsStore } from '~/core/state/customRPC';
import {
  CustomRPCAsset,
  useCustomRPCAssetsStore,
} from '~/core/state/customRPCAssets';
import { Box, Button, Inline, Stack, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { Checkbox } from '~/entries/popup/components/Checkbox/Checkbox';
import { maskInput } from '~/entries/popup/components/InputMask/utils';

const INITIAL_ASSET = {
  name: '',
  address: '' as Address,
  decimals: 18,
  symbol: '',
};

export function CustomRPC() {
  const { state } = useLocation();
  const { setActiveRPC, customChains, removeCustomRPC } = useCustomRPCsStore();
  const { customRPCAssets, addCustomRPCAsset, removeCustomRPCAsset } =
    useCustomRPCAssetsStore();
  const chainId = state?.chainId as number;
  const chain = customChains[chainId];
  const customRPCAssetsForChain = customRPCAssets[chainId];

  const [asset, setAsset] = useState<CustomRPCAsset>(INITIAL_ASSET);

  const onInputChange = useCallback(
    <T extends string | number | boolean>(
      value: string | boolean,
      type: 'string' | 'number' | 'boolean',
      data: 'address' | 'decimals' | 'symbol' | 'name',
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

  const validateAsset = useCallback(
    (asset: CustomRPCAsset) => {
      const dataValid =
        isValidAddress(asset.address) && asset.decimals && asset.symbol;
      const customRPCAssetsAddresses = customRPCAssetsForChain.map(
        (asset) => asset.address,
      );
      return dataValid && !customRPCAssetsAddresses.includes(asset.address);
    },
    [customRPCAssetsForChain],
  );

  const addAsset = useCallback(() => {
    const validAsset = validateAsset(asset);
    if (validAsset) {
      addCustomRPCAsset({ chainId, customRPCAsset: asset });
      setAsset(INITIAL_ASSET);
    }
  }, [addCustomRPCAsset, asset, chainId, validateAsset]);

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
                  {Object.keys(customRPC)?.map((key, i) => (
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

        {customRPCAssetsForChain?.map((asset, i) => (
          <Box
            background="surfaceSecondaryElevated"
            borderRadius="16px"
            boxShadow="12px"
            width="full"
            padding="16px"
            key={i}
          >
            <Stack space="4px">
              <Text
                align="left"
                weight="semibold"
                size="9pt"
                color="labelSecondary"
              >
                {asset.address}
              </Text>
              <Text
                align="left"
                weight="semibold"
                size="12pt"
                color="labelSecondary"
              >
                {asset.decimals}
              </Text>
              <Text
                align="left"
                weight="semibold"
                size="12pt"
                color="labelSecondary"
              >
                {asset.symbol}
              </Text>
            </Stack>
            <Inline alignHorizontal="right">
              <Button
                onClick={() =>
                  removeCustomRPCAsset({ address: asset.address, chainId })
                }
                color="accent"
                height="24px"
                variant="raised"
              >
                Remove Asset
              </Button>
            </Inline>
          </Box>
        ))}

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
                onInputChange<string>(t.target.value, 'string', 'name')
              }
              height="32px"
              placeholder="Name"
              variant="surface"
              value={asset.name}
            />
            <Input
              onChange={(t) =>
                onInputChange<string>(t.target.value, 'string', 'address')
              }
              height="32px"
              placeholder="Address"
              variant="surface"
              value={asset.address}
            />
            <Input
              onChange={(t) =>
                onInputChange<number>(t.target.value, 'number', 'decimals')
              }
              height="32px"
              placeholder="Decimals"
              variant="surface"
              value={asset.decimals}
            />
            <Input
              onChange={(t) =>
                onInputChange<string>(t.target.value, 'string', 'symbol')
              }
              height="32px"
              placeholder="name"
              variant="surface"
              value={asset.symbol}
            />

            <Inline alignHorizontal="right">
              <Button
                onClick={addAsset}
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
