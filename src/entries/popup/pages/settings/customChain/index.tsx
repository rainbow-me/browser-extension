import React, { useCallback, useState } from 'react';
import { Chain } from 'wagmi';

import { useChainMetadata } from '~/core/resources/chains/chainMetadata';
import { useCustomRPCsStore } from '~/core/state/customRPC';
import { useUserChainsStore } from '~/core/state/userChains';
import { isValidUrl } from '~/core/utils/connectedApps';
import { Box, Button, Inline, Stack, Text } from '~/design-system';
import { Form } from '~/entries/popup/components/Form/Form';
import { FormInput } from '~/entries/popup/components/Form/FormInput';
import { useDebounce } from '~/entries/popup/hooks/useDebounce';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

import { Checkbox } from '../../../components/Checkbox/Checkbox';
import { maskInput } from '../../../components/InputMask/utils';

export function SettingsCustomChain() {
  const navigate = useRainbowNavigate();
  const { customChains, addCustomRPC } = useCustomRPCsStore();
  const { addUserChain } = useUserChainsStore();
  const [customRPC, setCustomRPC] = useState<{
    active?: boolean;
    rpcUrl?: string;
    chainId?: number;
    name?: string;
    symbol?: string;
    explorerUrl?: string;
  }>({});
  const [validations, setValidations] = useState<{
    rpcUrl: boolean;
    chainId: boolean;
    name?: boolean;
    symbol?: boolean;
    explorerUrl?: boolean;
  }>({
    rpcUrl: true,
    chainId: true,
    name: true,
    symbol: true,
    explorerUrl: true,
  });
  const debuncedRpcUrl = useDebounce(customRPC.rpcUrl, 500);

  const {
    data: chainMetadata,
    isFetching: chainMetadataIsFetching,
    isError: chainMetadataIsError,
  } = useChainMetadata(
    { rpcUrl: debuncedRpcUrl },
    { enabled: !!debuncedRpcUrl && isValidUrl(debuncedRpcUrl) },
  );

  const onInputChange = useCallback(
    <T extends string | number | boolean>(
      value: string | boolean | number,
      type: 'string' | 'number' | 'boolean',
      data: 'rpcUrl' | 'chainId' | 'name' | 'symbol' | 'explorerUrl' | 'active',
    ) => {
      if (type === 'number' && typeof value === 'string') {
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

  const onRPCUrlChange = useCallback(
    async (rpcUrl: string) => {
      onInputChange<string>(rpcUrl, 'string', 'rpcUrl');
    },
    [onInputChange],
  );

  const validateRpcUrl = useCallback(
    async () =>
      !!customRPC.rpcUrl &&
      isValidUrl(customRPC.rpcUrl) &&
      !!chainMetadata?.chainId,
    [chainMetadata?.chainId, customRPC.rpcUrl],
  );

  const onRpcUrlBlur = useCallback(async () => {
    const validUrl = await validateRpcUrl();
    setValidations((prev) => ({ ...prev, rpcUrl: validUrl }));
  }, [validateRpcUrl]);

  const validateChainId = useCallback(
    () =>
      !!customRPC.chainId && !isNaN(parseInt(customRPC.chainId.toString(), 10)),
    [customRPC.chainId],
  );

  const onChainIdBlur = useCallback(() => {
    const validChainId = validateChainId();
    setValidations((prev) => ({ ...prev, chainId: validChainId }));
  }, [validateChainId]);

  const validateName = useCallback(() => !!customRPC.name, [customRPC.name]);

  const onNameBlur = useCallback(() => {
    const validName = validateName();
    setValidations((prev) => ({ ...prev, name: validName }));
  }, [validateName]);

  const validateSymbol = useCallback(
    () => !!customRPC.symbol,
    [customRPC.symbol],
  );

  const onSymbolBlur = useCallback(() => {
    const validSymbol = validateSymbol();
    setValidations((prev) => ({ ...prev, symbol: validSymbol }));
  }, [validateSymbol]);

  const validateExplorerUrl = useCallback(
    () => !!customRPC.explorerUrl && isValidUrl(customRPC.explorerUrl),
    [customRPC.explorerUrl],
  );

  const onExplorerUrlBlur = useCallback(() => {
    const validExplorerUrl = validateExplorerUrl();
    setValidations((prev) => ({ ...prev, explorerUrl: validExplorerUrl }));
  }, [validateExplorerUrl]);

  const validateAddCustomRpc = useCallback(
    async () =>
      Object.values(validations).reduce(
        (prev, current) => prev && current,
        true,
      ),
    [validations],
  );

  const addCustomRpc = useCallback(async () => {
    const { rpcUrl, chainId, name, symbol } = customRPC;
    const valid = await validateAddCustomRpc();
    if (valid && rpcUrl && chainId && name && symbol) {
      const chain: Chain = {
        id: chainId,
        name,
        network: name,
        nativeCurrency: {
          symbol,
          decimals: 18,
          name: symbol,
        },
        rpcUrls: { default: { http: [rpcUrl] }, public: { http: [rpcUrl] } },
      };
      addCustomRPC({
        chain,
      });
      addUserChain({ chainId });
    }
  }, [addCustomRPC, addUserChain, customRPC, validateAddCustomRpc]);

  return (
    <Box paddingHorizontal="20px">
      <Stack space="20px">
        {Object.keys(customChains)?.map((chainId, i) => (
          <Box
            key={i}
            background="surfaceSecondaryElevated"
            borderRadius="16px"
            boxShadow="12px"
            width="full"
            padding="16px"
            onClick={() =>
              navigate(ROUTES.SETTINGS__NETWORKS__CUSTOM_RPC__DETAILS, {
                state: {
                  chainId,
                },
              })
            }
          >
            <Stack space="16px">
              <Text size="14pt" weight="bold" align="left">
                Group chainId: {chainId}
              </Text>
              <Stack space="16px">
                {customChains[Number(chainId)]?.chains?.map((chain, j) => (
                  <Box key={j}>
                    <Inline alignHorizontal="justify">
                      <Text size="14pt" weight="bold" align="center">
                        {chain.rpcUrls.default.http[0]}
                      </Text>
                      <Text size="14pt" weight="bold" align="center">
                        {chain.rpcUrls.default.http[0] ===
                        customChains[Number(chainId)].activeRpcUrl
                          ? 'Active'
                          : ''}
                      </Text>
                    </Inline>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Box>
        ))}

        <Form>
          <FormInput
            onChange={(t) => onRPCUrlChange(t.target.value)}
            placeholder="Url"
            value={customRPC.rpcUrl}
            onBlur={onRpcUrlBlur}
            borderColor={
              validations.rpcUrl && !chainMetadataIsError ? 'accent' : 'red'
            }
            loading={chainMetadataIsFetching}
          />
          <FormInput
            onChange={(t) =>
              onInputChange<number>(t.target.value, 'number', 'chainId')
            }
            placeholder="ChainId"
            value={
              customRPC.chainId
                ? String(customRPC.chainId)
                : String(chainMetadata?.chainId || '')
            }
            onBlur={onChainIdBlur}
            borderColor={validations.chainId ? 'accent' : 'red'}
          />
          <FormInput
            onChange={(t) =>
              onInputChange<string>(t.target.value, 'string', 'name')
            }
            placeholder="name"
            value={customRPC.name}
            onBlur={onNameBlur}
            borderColor={validations.name ? 'accent' : 'red'}
          />
          <FormInput
            onChange={(t) =>
              onInputChange<string>(t.target.value, 'string', 'symbol')
            }
            placeholder="Symbol"
            value={customRPC.symbol}
            onBlur={onSymbolBlur}
            borderColor={validations.symbol ? 'accent' : 'red'}
          />
          <FormInput
            onChange={(t) =>
              onInputChange<string>(t.target.value, 'string', 'explorerUrl')
            }
            placeholder="Explorer url"
            value={customRPC.explorerUrl}
            onBlur={onExplorerUrlBlur}
            borderColor={validations.explorerUrl ? 'accent' : 'red'}
          />
          <Box padding="10px">
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
                  onInputChange<boolean>(!customRPC.active, 'boolean', 'active')
                }
                selected={!!customRPC.active}
              />
            </Inline>
          </Box>
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
        </Form>
      </Stack>
    </Box>
  );
}
