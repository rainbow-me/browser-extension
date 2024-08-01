import { isValidAddress } from '@ethereumjs/util';
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { Address } from 'viem';

import { useAssetMetadata } from '~/core/resources/assets/assetMetadata';
import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { useRainbowChainAssetsStore } from '~/core/state/rainbowChainAssets';
import { Box, Button, Inline, Stack } from '~/design-system';
import { Form } from '~/entries/popup/components/Form/Form';
import { FormInput } from '~/entries/popup/components/Form/FormInput';
import { maskInput } from '~/entries/popup/components/InputMask/utils';
import usePrevious from '~/entries/popup/hooks/usePrevious';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';

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
  const { customTokenDrafts, saveCustomTokenDraft } = usePopupInstanceStore();

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

  const navigate = useRainbowNavigate();
  const chainId = state?.chainId;
  const savedDraft = customTokenDrafts[chainId];
  const initialAsset = {
    address: savedDraft?.address || INITIAL_ASSET.address,
    decimals: savedDraft?.decimals || INITIAL_ASSET.decimals,
    name: savedDraft?.name || INITIAL_ASSET.name,
    symbol: savedDraft?.symbol || INITIAL_ASSET.symbol,
  };
  const customRPCAssetsForChain = useMemo(
    () => rainbowChainAssets[chainId] || [],
    [chainId, rainbowChainAssets],
  );

  const [asset, setAsset] = useState(initialAsset);

  const {
    data: assetMetadata = initialAsset,
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
      saveCustomTokenDraft(chainId, undefined);
      navigate(-1);
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
    navigate,
    saveCustomTokenDraft,
    validateAddCustomAsset,
  ]);

  useEffect(() => {
    saveCustomTokenDraft(chainId, asset);
  }, [asset, chainId, saveCustomTokenDraft]);

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
            tabIndex={0}
          />
          <FormInput
            onChange={(t) =>
              onInputChange<string>(t.target.value, 'string', 'name')
            }
            placeholder="Name"
            value={asset.name || assetMetadata?.name}
            onBlur={onNameBlur}
            borderColor={validations.name ? 'accent' : 'red'}
            tabIndex={0}
            testId={'token-name-field'}
          />
          <FormInput
            onChange={(t) =>
              onInputChange<number>(t.target.value, 'number', 'decimals')
            }
            placeholder="Decimals"
            value={asset.decimals || assetMetadata?.decimals}
            onBlur={onDecimalsBlur}
            borderColor={validations.decimals ? 'accent' : 'red'}
            tabIndex={0}
          />
          <FormInput
            onChange={(t) =>
              onInputChange<string>(t.target.value, 'string', 'symbol')
            }
            placeholder="Symbol"
            value={asset.symbol || assetMetadata?.symbol}
            onBlur={onSymbolBlur}
            borderColor={validations.symbol ? 'accent' : 'red'}
            tabIndex={0}
          />

          <Inline alignHorizontal="right">
            <Button
              onClick={addAsset}
              color="accent"
              height="36px"
              variant="raised"
              tabIndex={0}
            >
              Add
            </Button>
          </Inline>
        </Form>
      </Stack>
    </Box>
  );
}
