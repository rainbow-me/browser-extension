import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { useChainMetadata } from '~/core/resources/chains/chainMetadata';
import { useCustomRPCsStore } from '~/core/state/customRPC';
import { useUserChainsStore } from '~/core/state/userChains';
import { isValidUrl } from '~/core/utils/connectedApps';
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

const KNOWN_NETWORKS = {
  [i18n.t('settings.networks.custom_rpc.networks')]: [
    {
      name: 'Anvil Mainnet Fork',
      value: {
        rpcUrl: 'http://127.0.0.1:8545',
        chainId: 1,
        decimals: 18,
        symbol: 'ETH',
        explorerUrl: 'https://etherscan.io',
        testnet: true,
      },
    },
    {
      name: 'Anvil (Dev)',
      value: {
        rpcUrl: 'http://127.0.0.1:8545',
        chainId: 31337,
        decimals: 18,
        symbol: 'ETH',
        explorerUrl: 'https://etherscan.io',
        testnet: true,
      },
    },
    {
      name: 'Hardhat Mainnet Fork',
      value: {
        rpcUrl: 'http://127.0.0.1:8545',
        chainId: 1,
        decimals: 18,
        symbol: 'ETH',
        explorerUrl: 'https://etherscan.io',
        testnet: true,
      },
    },
    {
      name: 'Hardhat (Dev)',
      value: {
        rpcUrl: 'http://127.0.0.1:8545',
        chainId: 31337,
        decimals: 18,
        symbol: 'ETH',
        explorerUrl: 'https://etherscan.io',
        testnet: true,
      },
    },
    {
      name: 'Arbitrum Nova',
      value: {
        rpcUrl: 'https://nova.arbitrum.io/rpc',
        chainId: 42_170,
        decimals: 18,
        symbol: 'ETH',
        explorerUrl: 'https://nova.arbiscan.io',
        testnet: false,
      },
    },
    {
      name: 'Avalanche',
      value: {
        rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
        chainId: 43114,
        decimals: 18,
        symbol: 'AVAX',
        explorerUrl: 'https://cchain.explorer.avax.network',
        testnet: false,
      },
    },
    {
      name: 'Aurora',
      value: {
        rpcUrl: 'https://mainnet.aurora.dev',
        chainId: 1313161554,
        decimals: 18,
        symbol: 'ETH',
        explorerUrl: 'https://aurorascan.dev',
        testnet: false,
      },
    },
    {
      name: 'Canto',
      value: {
        rpcUrl: 'https://canto.gravitychain.io',
        chainId: 7_700,
        decimals: 18,
        symbol: 'CANTO',
        explorerUrl: 'https://tuber.build',
        testnet: false,
      },
    },
    {
      name: 'Celo',
      value: {
        rpcUrl: 'https://forno.celo.org',
        chainId: 42_220,
        decimals: 18,
        symbol: 'CELO',
        explorerUrl: 'https://explorer.celo.org/mainnet',
        testnet: false,
      },
    },
    {
      name: 'Ethereum Classic',
      value: {
        rpcUrl: 'https://etc.rivet.link',
        chainId: 61,
        decimals: 18,
        symbol: 'ETC',
        explorerUrl: 'https://blockscout.com/etc/mainnet',
        testnet: false,
      },
    },
    {
      name: 'Fantom',
      value: {
        rpcUrl: 'https://rpc.ankr.com/fantom',
        chainId: 250,
        decimals: 18,
        symbol: 'FTM',
        explorerUrl: 'https://ftmscan.com',
        testnet: false,
      },
    },
    {
      name: 'Flashbots Protect',
      value: {
        rpcUrl: 'https://rpc.flashbots.net',
        chainId: 1,
        decimals: 18,
        symbol: 'ETH',
        explorerUrl: 'https://etherscan.io',
        testnet: false,
      },
    },
    {
      name: 'Flashbots Protect (Fast)',
      value: {
        rpcUrl: 'https://rpc.flashbots.net/fast',
        chainId: 1,
        decimals: 18,
        symbol: 'ETH',
        explorerUrl: 'https://etherscan.io',
        testnet: false,
      },
    },
    {
      name: 'Filecoin',
      value: {
        rpcUrl: 'https://api.node.glif.io/rpc/v1',
        chainId: 314,
        decimals: 18,
        symbol: 'FIL',
        explorerUrl: 'https://filfox.info/en',
        testnet: false,
      },
    },
    {
      name: 'Gnosis',
      value: {
        rpcUrl: 'https://rpc.gnosischain.com',
        chainId: 100,
        decimals: 18,
        symbol: 'xDAI',
        explorerUrl: 'https://gnosisscan.io',
        testnet: false,
      },
    },
    {
      name: 'Linea',
      value: {
        rpcUrl: 'https://rpc.linea.build',
        chainId: 59_144,
        decimals: 18,
        symbol: 'ETH',
        explorerUrl: 'https://lineascan.build',
        testnet: false,
      },
    },
    {
      name: 'Mantle',
      value: {
        rpcUrl: 'https://rpc.mantle.xyz',
        chainId: 5000,
        decimals: 18,
        symbol: 'MNT',
        explorerUrl: 'https://explorer.mantle.xyz',
        testnet: false,
      },
    },
    {
      name: 'Metis',
      value: {
        rpcUrl: 'https://andromeda.metis.io/?owner=1088',
        chainId: 1_088,
        decimals: 18,
        symbol: 'METIS',
        explorerUrl: 'https://andromeda-explorer.metis.io',
        testnet: false,
      },
    },
    {
      name: 'Moonbeam',
      value: {
        rpcUrl: 'https://moonbeam.public.blastapi.io',
        chainId: 1284,
        decimals: 18,
        symbol: 'GLMR',
        explorerUrl: 'https://moonscan.io',
      },
    },
    {
      name: 'Polygon zkEVM',
      value: {
        rpcUrl: 'https://zkevm-rpc.com',
        chainId: 1101,
        decimals: 18,
        symbol: 'ETH',
        explorerUrl: 'https://zkevm.polygonscan.com',
        testnet: false,
      },
    },
    {
      name: 'PulseChain',
      value: {
        rpcUrl: 'https://rpc.pulsechain.com',
        chainId: 369,
        decimals: 18,
        symbol: 'PULSE',
        explorerUrl: 'https://pulsechain.com',
        testnet: false,
      },
    },
    {
      name: 'Scroll',
      value: {
        rpcUrl: 'https://rpc.scroll.io',
        chainId: 534_352,
        decimals: 18,
        symbol: 'ETH',
        explorerUrl: 'https://scrollscan.com',
        testnet: false,
      },
    },
    {
      name: 'zkSync',
      value: {
        rpcUrl: 'https://mainnet.era.zksync.io',
        chainId: 324,
        decimals: 18,
        symbol: 'ETH',
        explorerUrl: 'https://explorer.zksync.io',
        testnet: false,
      },
    },
  ],
};

export function SettingsCustomChain() {
  const {
    state: { chain },
  }: { state: { chain?: Chain } } = useLocation();
  const { addCustomRPC } = useCustomRPCsStore();
  const navigate = useRainbowNavigate();
  const { addUserChain } = useUserChainsStore();
  const [open, setOpen] = useState(false);
  const [customRPC, setCustomRPC] = useState<{
    active?: boolean;
    testnet?: boolean;
    rpcUrl?: string;
    chainId?: number;
    name?: string;
    symbol?: string;
    explorerUrl?: string;
  }>({
    testnet: chain?.testnet,
    chainId: chain?.id,
    symbol: chain?.nativeCurrency.symbol,
    explorerUrl: chain?.blockExplorers?.default.url,
    active: !chain, // True only if adding a new network
  });
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
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    data: chainMetadata,
    isFetching: chainMetadataIsFetching,
    isError: chainMetadataIsError,
    isFetched: chainMetadataIsFetched,
  } = useChainMetadata(
    { rpcUrl: debuncedRpcUrl },
    { enabled: !!debuncedRpcUrl && isValidUrl(debuncedRpcUrl) },
  );
  const prevChainMetadata = usePrevious(chainMetadata);

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

  const onChainIdBlur = useCallback(
    () => setValidations((prev) => ({ ...prev, chainId: validateChainId() })),
    [validateChainId],
  );

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
    const chainId = customRPC.chainId || chainMetadata?.chainId;
    const name = customRPC.name;
    const symbol = customRPC.symbol;
    const valid = validateAddCustomRpc();

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
      if (customRPC.testnet) {
        chain.testnet = true;
      }
      addCustomRPC({
        chain,
      });
      addUserChain({ chainId });
      triggerToast({
        title: i18n.t('settings.networks.custom_rpc.network_added'),
        description: i18n.t(
          'settings.networks.custom_rpc.network_added_correctly',
          { networkName: name },
        ),
      });
      setCustomRPC({});
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    }
  }, [
    addCustomRPC,
    addUserChain,
    chainMetadata?.chainId,
    customRPC.chainId,
    customRPC.name,
    customRPC.rpcUrl,
    customRPC.symbol,
    customRPC.testnet,
    navigate,
    validateAddCustomRpc,
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
      const network = KNOWN_NETWORKS.Networks.find(
        (network) => network.name === networkName,
      );
      if (network) {
        setCustomRPC((prev) => ({
          ...prev,
          ...network.value,
          name: networkName,
          active: true,
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
    [open],
  );

  return (
    <Box paddingHorizontal="20px">
      <Stack space="20px">
        <Form>
          <Autocomplete
            open={open}
            onFocus={() => setOpen(true)}
            onBlur={onNameBlur}
            data={KNOWN_NETWORKS}
            value={customRPC.name || ''}
            borderColor={validations.name ? 'accent' : 'red'}
            placeholder={i18n.t('settings.networks.custom_rpc.network_name')}
            onChange={(value) => onInputChange<string>(value, 'string', 'name')}
            onSelect={handleNetworkSelect}
            ref={inputRef}
          />
          <FormInput
            onChange={(t) =>
              onInputChange<string>(t.target.value, 'string', 'rpcUrl')
            }
            placeholder={i18n.t('settings.networks.custom_rpc.rpc_url')}
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
            placeholder={i18n.t('settings.networks.custom_rpc.chain_id')}
            value={customRPC.chainId || chainMetadata?.chainId || ''}
            onBlur={onChainIdBlur}
            borderColor={validations.chainId ? 'accent' : 'red'}
          />
          <FormInput
            onChange={(t) =>
              onInputChange<string>(t.target.value, 'string', 'symbol')
            }
            placeholder={i18n.t('settings.networks.custom_rpc.symbol')}
            value={customRPC.symbol}
            onBlur={onSymbolBlur}
            borderColor={validations.symbol ? 'accent' : 'red'}
          />
          <FormInput
            onChange={(t) =>
              onInputChange<string>(t.target.value, 'string', 'explorerUrl')
            }
            placeholder={i18n.t(
              'settings.networks.custom_rpc.block_explorer_url',
            )}
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
            <Inline alignHorizontal="justify">
              <Text
                align="center"
                weight="semibold"
                size="12pt"
                color="labelSecondary"
              >
                {i18n.t('settings.networks.custom_rpc.testnet')}
              </Text>
              <Checkbox
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
              variant="raised"
            >
              {i18n.t('settings.networks.custom_rpc.add_network')}
            </Button>
          </Inline>
        </Form>
      </Stack>
    </Box>
  );
}
