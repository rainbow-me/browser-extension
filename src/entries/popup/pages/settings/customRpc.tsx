import React, { useCallback, useState } from 'react';

import { useCustomRPCsStore } from '~/core/state/customRPC';
import { isValidUrl } from '~/core/utils/connectedApps';
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

  const validateRpcUrl = useCallback(
    () => !!customRPC.rpcUrl && isValidUrl(customRPC.rpcUrl),
    [customRPC.rpcUrl],
  );

  const onRpcUrlBlur = useCallback(() => {
    const validUrl = validateRpcUrl();
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

  const validateAddCustomRpc = useCallback(() => {
    const valid = Object.values(validations).reduce(
      (prev, current) => prev && current,
      true,
    );
    const validRpcUrl = validateRpcUrl();
    const validChainId = validateChainId();
    const validName = validateName();
    const validSymbol = validateSymbol();
    const validExplorerUrl = validateExplorerUrl();
    return (
      valid &&
      validRpcUrl &&
      validChainId &&
      validName &&
      validSymbol &&
      validExplorerUrl
    );
  }, [
    validateChainId,
    validateExplorerUrl,
    validateName,
    validateRpcUrl,
    validateSymbol,
    validations,
  ]);

  const addCustomRpc = useCallback(() => {
    const { rpcUrl, chainId, name, symbol } = customRPC;
    const valid = validateAddCustomRpc();
    if (valid && rpcUrl && chainId && name && symbol) {
      addCustomRPC({
        customRPC: { ...customRPC, rpcUrl, chainId, name, symbol },
      });
    }
  }, [addCustomRPC, customRPC, validateAddCustomRpc]);

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
              onBlur={onRpcUrlBlur}
              borderColor={validations.rpcUrl ? 'accent' : 'red'}
            />
            <Input
              onChange={(t) => onInputChange<number>(t, 'number', 'chainId')}
              height="32px"
              placeholder="ChainId"
              variant="surface"
              value={customRPC.chainId || ''}
              onBlur={onChainIdBlur}
              borderColor={validations.chainId ? 'accent' : 'red'}
            />
            <Input
              onChange={(t) => onInputChange<string>(t, 'string', 'name')}
              height="32px"
              placeholder="name"
              variant="surface"
              value={customRPC.name}
              onBlur={onNameBlur}
              borderColor={validations.name ? 'accent' : 'red'}
            />
            <Input
              onChange={(t) => onInputChange<string>(t, 'string', 'symbol')}
              height="32px"
              placeholder="Symbol"
              variant="surface"
              value={customRPC.symbol}
              onBlur={onSymbolBlur}
              borderColor={validations.symbol ? 'accent' : 'red'}
            />
            <Input
              onChange={(t) =>
                onInputChange<string>(t, 'string', 'explorerUrl')
              }
              height="32px"
              placeholder="Explorer url"
              variant="surface"
              value={customRPC.explorerUrl}
              onBlur={onExplorerUrlBlur}
              borderColor={validations.explorerUrl ? 'accent' : 'red'}
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
