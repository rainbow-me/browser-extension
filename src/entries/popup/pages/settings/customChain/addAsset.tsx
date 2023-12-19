import { isValidAddress } from '@ethereumjs/util';
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { Address } from 'wagmi';

import { useAssetMetadata } from '~/core/resources/assets/assetMetadata';
import { useRainbowChainAssetsStore } from '~/core/state/rainbowChainAssets';
import { Box, Button, Inline, Stack } from '~/design-system';
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

export function AddAsset() {
  const { state } = useLocation();
  const { rainbowChainAssets, addRainbowChainAsset } =
    useRainbowChainAssetsStore();

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
  const customRPCAssetsForChain = useMemo(
    () => rainbowChainAssets[chainId] || [],
    [chainId, rainbowChainAssets],
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
      addRainbowChainAsset({
        chainId,
        rainbowChainAsset: assetToAdd,
      });
      setAsset(INITIAL_ASSET);
    }
  }, [
    addRainbowChainAsset,
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
