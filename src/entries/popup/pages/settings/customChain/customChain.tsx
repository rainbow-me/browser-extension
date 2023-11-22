import { isValidAddress } from '@ethereumjs/util';
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import usePrevious from '~/entries/popup/hooks/usePrevious';

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

  const [validations, setValidations] = useState<{
    address: boolean;
    decimals: boolean;
    name?: boolean;
    symbol?: boolean;
  }>({
    address: true,
    decimals: true,
    name: true,
    symbol: true,
  });

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
    isFetched: assetMetadataIsFetched,
  } = useAssetMetadata(
    { assetAddress: asset.address, chainId },
    { enabled: isValidAddress(asset.address) },
  );

  const prevAssetMetadata = usePrevious(assetMetadata);

  const validateAddress = useCallback(
    () => asset.address && isValidAddress(asset.address),
    [asset.address],
  );

  const onAddressBlur = useCallback(
    () =>
      setValidations((validations) => ({
        ...validations,
        address: validateAddress(),
      })),
    [validateAddress],
  );

  const validateDecimals = useCallback(() => {
    const decimals = asset.decimals || assetMetadata.decimals;
    return (
      decimals !== undefined &&
      !isNaN(parseInt(String(decimals), 10)) &&
      decimals <= 18
    );
  }, [asset.decimals, assetMetadata.decimals]);

  const onDecimalsBlur = useCallback(
    () =>
      setValidations((validations) => ({
        ...validations,
        decimals: validateDecimals(),
      })),
    [validateDecimals],
  );

  const validateName = useCallback(() => {
    const name = asset.name || assetMetadata.name;
    return !!name && name.length > 0;
  }, [asset.name, assetMetadata.name]);

  const onNameBlur = useCallback(
    () =>
      setValidations((validations) => ({
        ...validations,
        name: validateName(),
      })),
    [validateName],
  );

  const validateSymbol = useCallback(() => {
    const symbol = asset.symbol || assetMetadata.symbol;
    return !!symbol && symbol.length > 0;
  }, [asset.symbol, assetMetadata.symbol]);

  const onSymbolBlur = useCallback(
    () =>
      setValidations((validations) => ({
        ...validations,
        symbol: validateSymbol(),
      })),
    [validateSymbol],
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

  const validateAddCustomAsset = useCallback(() => {
    const validAddress = validateAddress();
    const validName = validateName();
    const validDecimals = validateDecimals();
    const validSymbol = validateSymbol();
    setValidations({
      address: validAddress,
      decimals: validDecimals,
      name: validName,
      symbol: validSymbol,
    });
    return validAddress && validName && validDecimals && validSymbol;
  }, [validateAddress, validateDecimals, validateName, validateSymbol]);

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

    const validAsset = validateAddCustomAsset();

    if (validAsset && !customRPCAssetsAddresses.includes(assetToAdd.address)) {
      addCustomRPCAsset({
        chainId,
        customRPCAsset: assetToAdd,
      });
      setAsset(INITIAL_ASSET);
    }
  }, [
    addCustomRPCAsset,
    asset.address,
    asset.decimals,
    asset.name,
    asset.symbol,
    assetMetadata.decimals,
    assetMetadata.name,
    assetMetadata.symbol,
    chainId,
    customRPCAssetsForChain,
    validateAddCustomAsset,
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

  useEffect(() => {
    if (!isEqual(assetMetadata, prevAssetMetadata) && assetMetadataIsFetched) {
      validateAddCustomAsset();
    }
  }, [
    assetMetadata,
    assetMetadataIsFetched,
    prevAssetMetadata,
    validateAddCustomAsset,
  ]);

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
            onBlur={onAddressBlur}
            borderColor={validations.address ? 'accent' : 'red'}
          />
          <FormInput
            onChange={(t) =>
              onInputChange<string>(t.target.value, 'string', 'name')
            }
            placeholder="Name"
            value={asset.name || assetMetadata?.name}
            onBlur={onNameBlur}
            borderColor={validations.name ? 'accent' : 'red'}
          />
          <FormInput
            onChange={(t) =>
              onInputChange<number>(t.target.value, 'number', 'decimals')
            }
            placeholder="Decimals"
            value={asset.decimals || assetMetadata?.decimals}
            onBlur={onDecimalsBlur}
            borderColor={validations.decimals ? 'accent' : 'red'}
          />
          <FormInput
            onChange={(t) =>
              onInputChange<string>(t.target.value, 'string', 'symbol')
            }
            placeholder="Symbol"
            value={asset.symbol || assetMetadata?.symbol}
            onBlur={onSymbolBlur}
            borderColor={validations.symbol ? 'accent' : 'red'}
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
