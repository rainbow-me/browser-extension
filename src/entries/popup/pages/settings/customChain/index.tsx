import { isEqual } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { useChainMetadata } from '~/core/resources/chains/chainMetadata';
import { useRainbowChainsStore } from '~/core/state';
import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { useUserChainsStore } from '~/core/state/userChains';
import { getDappHostname, isValidUrl } from '~/core/utils/connectedApps';
import { Box, Button, Inline, Stack, Text } from '~/design-system';
import {
  Autocomplete,
  customNetworkInfo,
} from '~/entries/popup/components/Autocomplete';
import { Form } from '~/entries/popup/components/Form/Form';
import { FormInput } from '~/entries/popup/components/Form/FormInput';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { useDebounce } from '~/entries/popup/hooks/useDebounce';
import usePrevious from '~/entries/popup/hooks/usePrevious';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';

import { Checkbox } from '../../../components/Checkbox/Checkbox';
import { maskInput } from '../../../components/InputMask/utils';

const KNOWN_NETWORKS: { name: string; networkInfo: customNetworkInfo }[] = [
  {
    name: 'Anvil Mainnet Fork',
    networkInfo: {
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
    networkInfo: {
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
    networkInfo: {
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
    networkInfo: {
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
    networkInfo: {
      rpcUrl: 'https://nova.arbitrum.io/rpc',
      chainId: 42_170,
      decimals: 18,
      symbol: 'ETH',
      explorerUrl: 'https://nova.arbiscan.io',
      testnet: false,
    },
  },
  {
    name: 'Aurora',
    networkInfo: {
      rpcUrl: 'https://mainnet.aurora.dev',
      chainId: 1313161554,
      decimals: 18,
      symbol: 'ETH',
      explorerUrl: 'https://aurorascan.dev',
      testnet: false,
    },
  },
  {
    name: 'Blast',
    networkInfo: {
      rpcUrl: 'https://blast.blockpi.network/v1/rpc/public',
      chainId: 81457,
      decimals: 18,
      symbol: 'ETH',
      explorerUrl: 'https://blastscan.io',
      testnet: false,
    },
  },
  {
    name: 'Blast Testnet',
    networkInfo: {
      rpcUrl: 'https://sepolia.blast.io',
      chainId: 168587773,
      decimals: 18,
      symbol: 'ETH',
      explorerUrl: 'https://testnet.blastscan.io',
      testnet: true,
    },
  },
  {
    name: 'Boba Network',
    networkInfo: {
      rpcUrl: 'https://mainnet.boba.network',
      chainId: 288,
      decimals: 18,
      symbol: 'BOBA',
      explorerUrl: 'https://bobascan.com',
      testnet: false,
    },
  },
  {
    name: 'Canto',
    networkInfo: {
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
    networkInfo: {
      rpcUrl: 'https://forno.celo.org',
      chainId: 42_220,
      decimals: 18,
      symbol: 'CELO',
      explorerUrl: 'https://explorer.celo.org/mainnet',
      testnet: false,
    },
  },
  {
    name: 'Dogechain',
    networkInfo: {
      rpcUrl: 'https://rpc.dogechain.dog',
      chainId: 2_000,
      decimals: 18,
      symbol: 'DC',
      explorerUrl: 'https://explorer.dogechain.dog',
      testnet: false,
    },
  },
  {
    name: 'Ethereum Classic',
    networkInfo: {
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
    networkInfo: {
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
    networkInfo: {
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
    networkInfo: {
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
    networkInfo: {
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
    networkInfo: {
      rpcUrl: 'https://rpc.gnosischain.com',
      chainId: 100,
      decimals: 18,
      symbol: 'xDAI',
      explorerUrl: 'https://gnosisscan.io',
      testnet: false,
    },
  },
  {
    name: 'Immutable zkEVM',
    networkInfo: {
      rpcUrl: 'https://rpc.immutable.com',
      chainId: 13371,
      decimals: 18,
      symbol: 'IMX',
      explorerUrl: 'https://explorer.immutable.com',
      testnet: false,
    },
  },
  {
    name: 'Linea',
    networkInfo: {
      rpcUrl: 'https://rpc.linea.build',
      chainId: 59_144,
      decimals: 18,
      symbol: 'ETH',
      explorerUrl: 'https://lineascan.build',
      testnet: false,
    },
  },
  {
    name: 'Lyra',
    networkInfo: {
      rpcUrl: 'https://rpc.lyra.finance',
      chainId: 957,
      decimals: 18,
      symbol: 'ETH',
      explorerUrl: 'https://explorer.lyra.finance',
      testnet: false,
    },
  },
  {
    name: 'Manta',
    networkInfo: {
      rpcUrl: 'https://pacific-rpc.manta.network/http',
      chainId: 169,
      decimals: 18,
      symbol: 'ETH',
      explorerUrl: 'https://pacific-explorer.manta.network',
      testnet: false,
    },
  },
  {
    name: 'Mantle',
    networkInfo: {
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
    networkInfo: {
      rpcUrl: 'https://andromeda.metis.io/?owner=1088',
      chainId: 1_088,
      decimals: 18,
      symbol: 'METIS',
      explorerUrl: 'https://andromeda-explorer.metis.io',
      testnet: false,
    },
  },
  {
    name: 'Mode',
    networkInfo: {
      rpcUrl: 'https://mainnet.mode.network',
      chainId: 34443,
      decimals: 18,
      symbol: 'ETH',
      explorerUrl: 'https://explorer.mode.network',
      testnet: false,
    },
  },
  {
    name: 'Moonbeam',
    networkInfo: {
      rpcUrl: 'https://moonbeam.public.blastapi.io',
      chainId: 1284,
      decimals: 18,
      symbol: 'GLMR',
      explorerUrl: 'https://moonscan.io',
      testnet: false,
    },
  },
  {
    name: 'opBNB',
    networkInfo: {
      rpcUrl: 'https://opbnb-mainnet-rpc.bnbchain.org',
      chainId: 204,
      decimals: 18,
      symbol: 'BNB',
      explorerUrl: 'https://mainnet.opbnbscan.com',
      testnet: false,
    },
  },
  {
    name: 'Palm',
    networkInfo: {
      rpcUrl: 'https://palm-mainnet.public.blastapi.io',
      chainId: 11297108109,
      decimals: 18,
      symbol: 'PALM',
      explorerUrl: 'https://explorer.palm.io',
      testnet: false,
    },
  },
  {
    name: 'PGN',
    networkInfo: {
      rpcUrl: 'https://rpc.publicgoods.network',
      chainId: 424,
      decimals: 18,
      symbol: 'ETH',
      explorerUrl: 'https://explorer.publicgoods.network',
      testnet: false,
    },
  },
  {
    name: 'Polygon zkEVM',
    networkInfo: {
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
    networkInfo: {
      rpcUrl: 'https://rpc.pulsechain.com',
      chainId: 369,
      decimals: 18,
      symbol: 'PULSE',
      explorerUrl: 'https://pulsechain.com',
      testnet: false,
    },
  },
  {
    name: 'RARI Chain',
    networkInfo: {
      rpcUrl: 'https://mainnet.rpc.rarichain.org/http',
      chainId: 1380012617,
      decimals: 18,
      symbol: 'ETH',
      explorerUrl: 'https://mainnet.explorer.rarichain.org',
      testnet: false,
    },
  },
  {
    name: 'Redstone Testnet',
    networkInfo: {
      rpcUrl: 'https://rpc.holesky.redstone.xyz',
      chainId: 17001,
      decimals: 18,
      symbol: 'ETH',
      explorerUrl: 'https://explorer.holesky.redstone.xyz',
      testnet: true,
    },
  },
  {
    name: 'Scroll',
    networkInfo: {
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
    networkInfo: {
      rpcUrl: 'https://mainnet.era.zksync.io',
      chainId: 324,
      decimals: 18,
      symbol: 'ETH',
      explorerUrl: 'https://explorer.zksync.io',
      testnet: false,
    },
  },
];

const KNOWN_NETWORKS_AUTOCOMPLETE_DICT = {
  [i18n.t('settings.networks.custom_rpc.networks')]: KNOWN_NETWORKS,
};

export function SettingsCustomChain() {
  const {
    state: { chain },
  }: { state: { chain?: Chain } } = useLocation();
  const { addCustomRPC, setActiveRPC } = useRainbowChainsStore();
  const navigate = useRainbowNavigate();
  const { addUserChain } = useUserChainsStore();
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
    if (
      KNOWN_NETWORKS.some((n) =>
        (['rpcUrl'] as const).every((k) => n.networkInfo[k] === customRPC[k]),
      )
    )
      return true; // if customRPC is a KNOWN NETWORK skip validation

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
      if (customRPC.active) {
        setActiveRPC({
          rpcUrl,
          chainId,
        });
      }
      setCustomRPC({});
      navigate(-1);
    }
  }, [
    addCustomRPC,
    addUserChain,
    chainMetadata?.chainId,
    customRPC.active,
    customRPC.chainId,
    customRPC.explorerUrl,
    customRPC.name,
    customRPC.rpcUrl,
    customRPC.symbol,
    customRPC.testnet,
    navigate,
    setActiveRPC,
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
      const network = KNOWN_NETWORKS.find(
        (network) => network.name === networkName,
      );
      if (network) {
        setCustomRPC((prev) => ({
          ...prev,
          ...network.networkInfo,
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
    [open],
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
            data={KNOWN_NETWORKS_AUTOCOMPLETE_DICT}
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
