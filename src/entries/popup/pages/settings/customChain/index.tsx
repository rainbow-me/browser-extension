import { isEqual } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Chain } from 'viem';

import { i18n } from '~/core/languages';
import { useChainMetadata } from '~/core/resources/chains/chainMetadata';
import { useDeveloperToolsEnabledStore } from '~/core/state/currentSettings/developerToolsEnabled';
import { networkStore } from '~/core/state/networks/networks';
import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { getDappHostname, isValidUrl } from '~/core/utils/connectedApps';
import { Box, Button, Inline, Stack, Text } from '~/design-system';
import { Autocomplete } from '~/entries/popup/components/Autocomplete';
import { Form } from '~/entries/popup/components/Form/Form';
import { FormInput } from '~/entries/popup/components/Form/FormInput';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { useDebounce } from '~/entries/popup/hooks/useDebounce';
import usePrevious from '~/entries/popup/hooks/usePrevious';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';

import { Checkbox } from '../../../components/Checkbox/Checkbox';
import { maskInput } from '../../../components/InputMask/utils';

export function SettingsCustomChain() {
  const {
    state: { chain },
  }: { state: { chain?: Chain } } = useLocation();
  const navigate = useRainbowNavigate();

  const customNetworks = networkStore((state) =>
    state.getSupportedCustomNetworks(),
  );

  const addCustomChain = networkStore((state) => state.addCustomChain);

  const { developerToolsEnabled } = useDeveloperToolsEnabledStore();
  const knownNetworksAutocomplete = useMemo(
    () => ({
      [i18n.t('settings.networks.custom_rpc.networks')]: customNetworks.filter(
        (network) =>
          developerToolsEnabled ? true : !network.testnet.isTestnet,
      ),
    }),
    [developerToolsEnabled, customNetworks],
  );

  const { customNetworkDrafts, saveCustomNetworkDraft } =
    usePopupInstanceStore();
  const draftKey = chain?.id ?? 'new';
  const savedDraft = customNetworkDrafts[draftKey];
  const [open, setOpen] = useState(false);
  const [customRPC, setCustomRPC] = useState<{
    active?: boolean;
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
      active: !chain, // True only if adding a new network
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
  const inputRef = useRef<HTMLInputElement>(null);

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
        | 'active'
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
    return !!inputRef.current?.value;
  }, []);

  const onNameBlur = useCallback(() => {
    setValidations((prev) => ({ ...prev, name: validateName() }));
    open && setOpen(false);
  }, [open, validateName]);

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
      addCustomChain(chainId, chain, rpcUrl, customRPC.active ?? false);
      triggerToast({
        title: i18n.t('settings.networks.custom_rpc.network_added'),
        description: i18n.t(
          'settings.networks.custom_rpc.network_added_correctly',
          { networkName: name },
        ),
      });
      setCustomRPC({});
      navigate(-1);
    }
  }, [
    chain,
    chainMetadata?.chainId,
    customRPC,
    navigate,
    validateAddCustomRpc,
    addCustomChain,
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

  const handleNetworkSelect = useCallback(
    (networkName: string) => {
      const network = customNetworks.find(
        (network) => network.name === networkName,
      );
      if (network) {
        setCustomRPC((prev) => ({
          ...prev,
          testnet: network.testnet.isTestnet,
          rpcUrl: network.defaultRPCURL,
          explorerUrl: network.defaultExplorerURL,
          symbol: network.nativeAsset.symbol,
          name: networkName,
          active: true,
          chainId: undefined,
        }));

        // All these are previously validated by us
        // when adding the network to the list
        setValidations({
          rpcUrl: true,
          chainId: true,
          name: true,
          symbol: true,
          explorerUrl: true,
        });
      }
      open && setOpen(false);
    },
    [open, customNetworks],
  );

  return (
    <Box paddingHorizontal="20px">
      <Stack space="20px">
        <Form>
          <Autocomplete
            autoFocus
            open={!chain ? open : false}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              customRPC.name && onNameBlur();
              setOpen(false);
            }}
            data={knownNetworksAutocomplete}
            value={customRPC.name || ''}
            borderColor={validations.name ? 'transparent' : 'red'}
            placeholder={i18n.t('settings.networks.custom_rpc.network_name')}
            onChange={(value) => {
              onInputChange<string>(value, 'string', 'name');
              if (!validations.name) {
                setValidations((prev) => ({ ...prev, name: true }));
              }
            }}
            onSelect={handleNetworkSelect}
            ref={inputRef}
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
                {i18n.t('settings.networks.custom_rpc.active')}
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
          <Inline alignHorizontal="right">
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
          </Inline>
        </Form>
      </Stack>
    </Box>
  );
}
