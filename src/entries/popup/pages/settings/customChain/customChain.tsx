import { isValidAddress } from '@ethereumjs/util';
import React, { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { Address, Chain } from 'wagmi';

import { useAssetMetadata } from '~/core/resources/assets/assetMetadata';
import { CustomChain, useCustomRPCsStore } from '~/core/state/customRPC';
import { useCustomRPCAssetsStore } from '~/core/state/customRPCAssets';
import { useUserChainsStore } from '~/core/state/userChains';
import { Box, Button, Inline, Stack, Text } from '~/design-system';
import { Checkbox } from '~/entries/popup/components/Checkbox/Checkbox';
import { Form } from '~/entries/popup/components/Form/Form';
import { FormInput } from '~/entries/popup/components/Form/FormInput';
import { maskInput } from '~/entries/popup/components/InputMask/utils';

const INITIAL_ASSET = {
  name: '',
  address: '' as Address,
  decimals: undefined,
  symbol: '',
};

export function CustomChain() {
  const { state } = useLocation();
  const { setActiveRPC, customChains, removeCustomRPC } = useCustomRPCsStore();
  const { customRPCAssets, addCustomRPCAsset, removeCustomRPCAsset } =
    useCustomRPCAssetsStore();
  const { removeUserChain } = useUserChainsStore();

  const chainId = state?.chainId;
  const customChain = customChains[chainId];
  const customRPCAssetsForChain = useMemo(
    () => customRPCAssets[chainId] || [],
    [chainId, customRPCAssets],
  );

  const [asset, setAsset] = useState(INITIAL_ASSET);

  const {
    data: assetMetadata = INITIAL_ASSET,
    isFetching: assetMetadataIsFetching,
  } = useAssetMetadata(
    { assetAddress: asset.address, chainId },
    { enabled: isValidAddress(asset.address) },
  );

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

  const addAsset = useCallback(() => {
    const assetToAdd = {
      name: asset.name || assetMetadata.name || '',
      address: asset.address,
      symbol: asset.symbol ? asset.symbol : assetMetadata.symbol || '',
      decimals: asset.decimals ? asset.decimals : assetMetadata.decimals || 0,
    };

    const customRPCAssetsAddresses = customRPCAssetsForChain.map(
      (asset) => asset.address,
    );

    if (
      assetToAdd.address &&
      assetToAdd.name &&
      assetToAdd.decimals &&
      assetToAdd.symbol &&
      isValidAddress(assetToAdd.address) &&
      !customRPCAssetsAddresses.includes(assetToAdd.address)
    ) {
      addCustomRPCAsset({
        chainId,
        customRPCAsset: assetToAdd,
      });
      setAsset(INITIAL_ASSET);
    }
  }, [
    addCustomRPCAsset,
    asset,
    assetMetadata,
    chainId,
    customRPCAssetsForChain,
  ]);

  const removeCustomChain = useCallback(
    ({ chain }: { chain: Chain; customChain: CustomChain }) => {
      if (customChain.chains.length === 1) {
        removeUserChain({ chainId });
      }
      removeCustomRPC({
        rpcUrl: chain.rpcUrls.default.http[0],
      });
    },
    [chainId, customChain.chains.length, removeCustomRPC, removeUserChain],
  );

  return (
    <Box paddingHorizontal="20px">
      <Stack space="24px">
        <Stack space="16px">
          {customChain?.chains?.map((chain, i) => {
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
                  {Object.keys(chain)?.map((key, i) => (
                    <Box key={i}>
                      <Inline space="4px">
                        <Text size="14pt" weight="bold" align="center">
                          {`${key}:`}
                        </Text>
                        <Text size="14pt" weight="bold" align="center">
                          {`${String(chain[key as keyof typeof chain])}`}
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
                          rpcUrl: chain.rpcUrls.default.http[0],
                          chainId: chain.id,
                        })
                      }
                      selected={
                        customChain.activeRpcUrl ===
                        chain.rpcUrls.default.http[0]
                      }
                    />
                  </Inline>
                  <Inline alignHorizontal="right">
                    <Button
                      onClick={() => removeCustomChain({ customChain, chain })}
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

        <Form>
          <FormInput
            onChange={(t) =>
              onInputChange<string>(t.target.value, 'string', 'address')
            }
            placeholder="Address"
            value={asset.address}
            loading={assetMetadataIsFetching}
          />
          <FormInput
            onChange={(t) =>
              onInputChange<string>(t.target.value, 'string', 'name')
            }
            placeholder="Name"
            value={asset.name || assetMetadata?.name}
          />
          <FormInput
            onChange={(t) =>
              onInputChange<number>(t.target.value, 'number', 'decimals')
            }
            placeholder="Decimals"
            value={asset.decimals || assetMetadata?.decimals}
          />
          <FormInput
            onChange={(t) =>
              onInputChange<string>(t.target.value, 'string', 'symbol')
            }
            placeholder="Symbol"
            value={asset.symbol || assetMetadata?.symbol}
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
        </Form>
      </Stack>
    </Box>
  );
}
