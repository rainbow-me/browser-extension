import { isEqual } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { Chain } from 'viem';

import { i18n } from '~/core/languages';
import { useChainMetadata } from '~/core/resources/chains/chainMetadata';
import { useNetworkStore } from '~/core/state/networks/networks';
import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { getDappHostname, isValidUrl } from '~/core/utils/connectedApps';
import { Box, Button, Inline, Inset, Stack, Text } from '~/design-system';
import { Form } from '~/entries/popup/components/Form/Form';
import { FormInput } from '~/entries/popup/components/Form/FormInput';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { useDebounce } from '~/entries/popup/hooks/useDebounce';
import usePrevious from '~/entries/popup/hooks/usePrevious';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

import { Checkbox } from '../../../components/Checkbox/Checkbox';
import { maskInput } from '../../../components/InputMask/utils';

export function SettingsCustomChain() {
  const {
    state: { chain },
  }: { state: { chain?: Chain } } = useLocation();
  const navigate = useRainbowNavigate();

  const customNetworks = useNetworkStore((state) =>
    state.getSupportedCustomNetworks(),
  );

  const addCustomChain = useNetworkStore((state) => state.addCustomChain);

  const { customNetworkDrafts, saveCustomNetworkDraft } =
    usePopupInstanceStore();
  const draftKey = chain?.id ?? 'new';
  const savedDraft = customNetworkDrafts[draftKey];
  const [customRPC, setCustomRPC] = useState<{
    testnet?: boolean;
    rpcUrl?: string;
    chainId?: number;
    name?: string;
    symbol?: string;
    explorerUrl?: string;
  }>(
    savedDraft || {
      testnet: chain?.testnet,
      chainId: chain?.id,
      symbol: chain?.nativeCurrency.symbol,
      explorerUrl: chain?.blockExplorers?.default.url,
    },
  );
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

  const debouncedRpcUrl = useDebounce(customRPC.rpcUrl, 1000);
  const {
    data: chainMetadata,
    isFetching: chainMetadataIsFetching,
    isError: chainMetadataIsError,
    isFetched: chainMetadataIsFetched,
  } = useChainMetadata(
    { rpcUrl: debouncedRpcUrl },
    { enabled: !!debouncedRpcUrl && isValidUrl(debouncedRpcUrl) },
  );
  const prevChainMetadata = usePrevious(chainMetadata);

  useEffect(() => {
    saveCustomNetworkDraft(draftKey, customRPC);
  }, [draftKey, customRPC, saveCustomNetworkDraft]);

  const onInputChange = useCallback(
    <T extends string | number | boolean>(
      value: string | boolean | number,
      type: 'string' | 'number' | 'boolean',
      data:
        | 'rpcUrl'
        | 'chainId'
        | 'name'
        | 'symbol'
        | 'explorerUrl'
        | 'testnet',
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

  const validateRpcUrl = useCallback(
    () =>
      !!customRPC.rpcUrl &&
      isValidUrl(customRPC.rpcUrl) &&
      !!chainMetadata?.chainId,
    [chainMetadata?.chainId, customRPC.rpcUrl],
  );

  useEffect(() => {
    if (chainMetadataIsError) {
      triggerToast({
        title: i18n.t('settings.networks.custom_rpc.cant_connect'),
        description: i18n.t('settings.networks.custom_rpc.rpc_not_responding'),
      });
    }
  }, [chainMetadataIsError]);

  const onRpcUrlBlur = useCallback(
    async () =>
      setValidations((prev) => ({ ...prev, rpcUrl: validateRpcUrl() })),
    [validateRpcUrl],
  );

  const validateChainId = useCallback(() => {
    const chainId = customRPC.chainId || chainMetadata?.chainId;
    return !!chainId && !isNaN(parseInt(chainId.toString(), 10));
  }, [chainMetadata?.chainId, customRPC.chainId]);

  const validateName = useCallback(() => {
    return !!customRPC.name;
  }, [customRPC.name]);

  const onNameBlur = useCallback(() => {
    setValidations((prev) => ({ ...prev, name: validateName() }));
  }, [validateName]);

  const validateSymbol = useCallback(
    () => !!customRPC.symbol,
    [customRPC.symbol],
  );

  const onSymbolBlur = useCallback(
    () => setValidations((prev) => ({ ...prev, symbol: validateSymbol() })),
    [validateSymbol],
  );

  const validateExplorerUrl = useCallback(
    () => (customRPC.explorerUrl ? isValidUrl(customRPC.explorerUrl) : true),
    [customRPC.explorerUrl],
  );

  const onExplorerUrlBlur = useCallback(
    () =>
      setValidations((prev) => ({
        ...prev,
        explorerUrl: validateExplorerUrl(),
      })),
    [validateExplorerUrl],
  );

  const validateAddCustomRpc = useCallback(() => {
    if (customNetworks.some((n) => n.defaultRPCURL === customRPC.rpcUrl)) {
      // if the rpc url is coming from our backend-driven custom networks, skip validation
      return true;
    }

    const validRpcUrl = validateRpcUrl();
    const validChainId = validateChainId();
    const validName = validateName();
    const validSymbol = validateSymbol();
    const validExplorerUrl = validateExplorerUrl();
    setValidations({
      rpcUrl: validRpcUrl,
      chainId: validChainId,
      name: validName,
      symbol: validSymbol,
      explorerUrl: validExplorerUrl,
    });
    return (
      validRpcUrl &&
      validChainId &&
      validName &&
      validSymbol &&
      validExplorerUrl
    );
  }, [
    validateChainId,
    validateRpcUrl,
    validateExplorerUrl,
    validateName,
    validateSymbol,
    customRPC,
    customNetworks,
  ]);

  const validateCustomRpcMetadata = useCallback(() => {
    const validRpcUrl = validateRpcUrl();
    const validChainId = validateChainId();
    setValidations((validations) => ({
      ...validations,
      rpcUrl: validRpcUrl,
      chainId: validChainId,
    }));
    return validRpcUrl && validChainId;
  }, [validateChainId, validateRpcUrl]);

  const addCustomRpc = useCallback(async () => {
    const rpcUrl = customRPC.rpcUrl;
    const chainId = customRPC.chainId || chainMetadata?.chainId || chain?.id;
    const name = customRPC.name || chain?.name;
    const symbol = customRPC.symbol || chain?.nativeCurrency.symbol;
    const valid = validateAddCustomRpc();

    if (valid && rpcUrl && chainId && name && symbol) {
      const chain: Chain = {
        id: chainId,
        name,
        nativeCurrency: {
          symbol,
          decimals: 18,
          name: symbol,
        },
        rpcUrls: { default: { http: [rpcUrl] }, public: { http: [rpcUrl] } },
        blockExplorers: {
          default: {
            name: customRPC.explorerUrl
              ? getDappHostname(customRPC.explorerUrl)
              : '',
            url: customRPC.explorerUrl || '',
          },
        },
        testnet: customRPC.testnet,
      };
      addCustomChain(chainId, chain, rpcUrl, true); // active by default
      triggerToast({
        title: i18n.t('settings.networks.custom_rpc.network_added'),
        description: i18n.t(
          'settings.networks.custom_rpc.network_added_correctly',
          { networkName: name },
        ),
      });
      setCustomRPC({});
      if (draftKey === 'new') {
        navigate(ROUTES.SETTINGS__NETWORKS, {
          state: { backTo: ROUTES.SETTINGS },
        });
      } else {
        navigate(-1);
      }
    }
  }, [
    chain,
    chainMetadata?.chainId,
    customRPC,
    navigate,
    validateAddCustomRpc,
    addCustomChain,
    draftKey,
  ]);

  useEffect(() => {
    if (!isEqual(chainMetadata, prevChainMetadata) && chainMetadataIsFetched) {
      validateCustomRpcMetadata();
    }
  }, [
    chainMetadata,
    chainMetadataIsFetched,
    prevChainMetadata,
    validateAddCustomRpc,
    validateCustomRpcMetadata,
  ]);

  return (
    <Box paddingHorizontal="20px">
      <Stack space="20px">
        <Form>
          <FormInput
            onChange={(t) => {
              onInputChange<string>(t.target.value, 'string', 'name');
              if (!validations.name) {
                setValidations((prev) => ({ ...prev, name: true }));
              }
            }}
            placeholder={i18n.t('settings.networks.custom_rpc.network_name')}
            value={customRPC.name || ''}
            onBlur={() => customRPC.name && onNameBlur()}
            borderColor={validations.name ? 'transparent' : 'red'}
            spellCheck={false}
            tabIndex={1}
            testId={'network-name-field'}
          />
          <FormInput
            onChange={(t) => {
              onInputChange<string>(t.target.value, 'string', 'rpcUrl');
              if (!validations.rpcUrl) {
                setValidations((prev) => ({ ...prev, rpcUrl: true }));
              }
            }}
            placeholder={i18n.t('settings.networks.custom_rpc.rpc_url')}
            value={customRPC.rpcUrl}
            onBlur={() => customRPC.rpcUrl && onRpcUrlBlur()}
            borderColor={
              validations.rpcUrl && !chainMetadataIsError
                ? 'transparent'
                : 'red'
            }
            loading={chainMetadataIsFetching}
            spellCheck={false}
            tabIndex={2}
            testId={'custom-network-rpc-url'}
          />
          <FormInput
            onChange={(t) => {
              onInputChange<string>(t.target.value, 'string', 'symbol');
              if (!validations.symbol) {
                setValidations((prev) => ({ ...prev, symbol: true }));
              }
            }}
            placeholder={i18n.t('settings.networks.custom_rpc.symbol')}
            value={customRPC.symbol}
            onBlur={() => customRPC.symbol && onSymbolBlur()}
            borderColor={
              validations.symbol || !customRPC.symbol ? 'transparent' : 'red'
            }
            spellCheck={false}
            tabIndex={3}
            testId={'custom-network-symbol'}
          />
          <FormInput
            onChange={(t) => {
              onInputChange<string>(t.target.value, 'string', 'explorerUrl');
              if (!validations.explorerUrl) {
                setValidations((prev) => ({ ...prev, explorerUrl: true }));
              }
            }}
            placeholder={i18n.t(
              'settings.networks.custom_rpc.block_explorer_url',
            )}
            value={customRPC.explorerUrl}
            onBlur={() => customRPC.explorerUrl && onExplorerUrlBlur()}
            borderColor={validations.explorerUrl ? 'transparent' : 'red'}
            spellCheck={false}
            tabIndex={4}
          />
          <Box padding="10px">
            <Inline alignHorizontal="justify" alignVertical="center">
              <Text
                align="center"
                weight="semibold"
                size="12pt"
                color="labelSecondary"
              >
                {i18n.t('settings.networks.custom_rpc.testnet')}
              </Text>
              <Checkbox
                testId={'testnet-toggle'}
                borderColor="accent"
                onClick={() =>
                  onInputChange<boolean>(
                    !customRPC.testnet,
                    'boolean',
                    'testnet',
                  )
                }
                selected={!!customRPC.testnet}
              />
            </Inline>
          </Box>
          <Inset top="10px">
            <Button
              onClick={addCustomRpc}
              color="accent"
              height="36px"
              tabIndex={6}
              variant="raised"
              width="full"
              testId={'add-custom-network-button'}
            >
              {i18n.t('settings.networks.custom_rpc.add_network')}
            </Button>
          </Inset>
        </Form>
      </Stack>
    </Box>
  );
}
