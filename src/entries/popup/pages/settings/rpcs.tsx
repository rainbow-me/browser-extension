import chroma from 'chroma-js';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Address, Chain } from 'viem';

import { i18n } from '~/core/languages';
import {
  SUPPORTED_CHAINS,
  SUPPORTED_CHAIN_IDS,
} from '~/core/references/chains';
import { selectUserAssetsDictByChain } from '~/core/resources/_selectors/assets';
import { useCustomNetworkAssets } from '~/core/resources/assets/customNetworkAssets';
import {
  useCurrentAddressStore,
  useCurrentCurrencyStore,
  useRainbowChainsStore,
} from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useDeveloperToolsEnabledStore } from '~/core/state/currentSettings/developerToolsEnabled';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useRainbowChainAssetsStore } from '~/core/state/rainbowChainAssets';
import { useUserChainsStore } from '~/core/state/userChains';
import { getSupportedChains } from '~/core/utils/chains';
import { getDappHost } from '~/core/utils/connectedApps';
import { chainIdMap } from '~/core/utils/userChains';
import {
  Box,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Separator,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { foregroundColors } from '~/design-system/styles/designTokens';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

import { ChainBadge } from '../../components/ChainBadge/ChainBadge';
import { CoinIcon } from '../../components/CoinIcon/CoinIcon';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../../components/ContextMenu/ContextMenu';
import {
  MoreInfoButton,
  MoreInfoOption,
} from '../../components/MoreInfoButton/MoreInfoButton';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

const isDefaultRPC = (chain: Chain) => {
  const rpc = SUPPORTED_CHAINS.find((c) => c.id === chain.id)?.rpcUrls.default
    .http[0];
  if (!rpc) return false;
  return chain.rpcUrls.default.http[0] === rpc;
};

export function SettingsNetworksRPCs() {
  const { featureFlags } = useFeatureFlagsStore();
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { currentTheme } = useCurrentThemeStore();
  const {
    state: { chainId },
  } = useLocation();
  const { removeRainbowChainAsset, removeRainbowChainAssets } =
    useRainbowChainAssetsStore();

  const { data: customNetworkAssets = {} } = useCustomNetworkAssets(
    {
      filterZeroBalance: false,
      address: currentAddress,
      currency: currentCurrency,
    },
    {
      select: selectUserAssetsDictByChain,
    },
  );

  const green = foregroundColors.green;

  const customNetworkAssetsForChain = useMemo(
    () =>
      Object.values(customNetworkAssets?.[chainId] || {}).filter(
        (asset) => !asset.isNativeAsset,
      ),
    [chainId, customNetworkAssets],
  );

  const navigate = useRainbowNavigate();
  const { developerToolsEnabled } = useDeveloperToolsEnabledStore();
  const { rainbowChains, setActiveRPC, removeCustomRPC } =
    useRainbowChainsStore();

  const rainbowChain = rainbowChains[Number(chainId)];

  const activeCustomRPC = rainbowChain?.chains.find(
    (chain) => chain.rpcUrls.default.http[0] === rainbowChain.activeRpcUrl,
  );

  const userChains = useUserChainsStore.use.userChains();
  const updateUserChain = useUserChainsStore.use.updateUserChain();
  const removeUserChain = useUserChainsStore.use.removeUserChain();

  const handleToggleChain = useCallback(
    (newVal: boolean) => {
      updateUserChain({
        chainId: chainId,
        enabled: newVal,
      });
    },
    [chainId, updateUserChain],
  );

  const handleRPCClick = useCallback(
    (rpcUrl: string): void => {
      setActiveRPC({
        rpcUrl,
        chainId: chainId,
      });
    },
    [chainId, setActiveRPC],
  );

  const supportedChain = useMemo(
    () => SUPPORTED_CHAINS.find(({ id }) => id === chainId),
    [chainId],
  );

  const mainnetChains = useMemo(
    () =>
      rainbowChain?.chains
        .filter((chain) => !chain.testnet)
        .sort((a, b) => {
          if (isDefaultRPC(a)) return -1;
          if (isDefaultRPC(b)) return 1;
          return 0;
        }) || [],
    [rainbowChain],
  );

  const options = ({ address }: { address: Address }): MoreInfoOption[] => [
    {
      label: i18n.t('settings.networks.custom_rpc.remove_token'),
      color: 'red',
      symbol: 'trash.fill',
      onSelect: () =>
        removeRainbowChainAsset({
          chainId,
          address,
        }),
      disabled: false,
      separator: false,
    },
  ];

  const testnetChains = useMemo(() => {
    const customTestnetChains =
      rainbowChains[Number(chainId)]?.chains?.filter(
        (chain) => chain.testnet,
      ) || [];
    const supportedTestnetChains = getSupportedChains({
      testnets: true,
    }).filter((chain) => {
      return chainIdMap[chainId]?.includes(chain.id) && chain.id !== chainId;
    });
    return [...customTestnetChains, ...supportedTestnetChains];
  }, [chainId, rainbowChains]);

  const handleRemoveRPC = useCallback(
    (chain: Chain) => {
      removeCustomRPC({
        rpcUrl: chain.rpcUrls.default.http[0],
      });
      removeRainbowChainAssets({ chainId });
      removeUserChain({ chainId });
      // If there's no default chain & only had one chain, go back
      const allChainsCount = [...mainnetChains, ...testnetChains].length;
      if (!supportedChain && allChainsCount === 1) {
        navigate(-1);
      }
    },
    [
      chainId,
      mainnetChains,
      navigate,
      removeCustomRPC,
      removeRainbowChainAssets,
      removeUserChain,
      supportedChain,
      testnetChains,
    ],
  );

  const handleRemoveNetwork = useCallback(
    ({ chainId }: { chainId: number }) => {
      const rainbowChain = rainbowChains[chainId];
      if (rainbowChain) {
        rainbowChain.chains.forEach((chain) => {
          removeCustomRPC({
            rpcUrl: chain.rpcUrls.default.http[0],
          });
          removeRainbowChainAssets({ chainId });
        });
      }
      navigate(-1);
    },
    [navigate, rainbowChains, removeCustomRPC, removeRainbowChainAssets],
  );

  return (
    <Box paddingHorizontal="20px" paddingBottom="20px">
      <MenuContainer testId="settings-menu-container">
        <Menu>
          <MenuItem
            first
            last
            titleComponent={
              <MenuItem.Title text={i18n.t('settings.networks.enabled')} />
            }
            rightComponent={
              <Toggle
                testId="disable-network-toggle"
                checked={userChains[chainId]}
                handleChange={handleToggleChain}
                tabIndex={-1}
              />
            }
            onToggle={() => handleToggleChain(!userChains[chainId])}
          />
        </Menu>
        {supportedChain || mainnetChains?.length ? (
          <Menu>
            <MenuItem.Description
              color="labelSecondary"
              text={i18n.t('settings.networks.rpc_endpoints')}
              weight="bold"
            />
            <Box paddingHorizontal="1px" paddingVertical="1px">
              {mainnetChains.map((chain, index) => (
                <Box
                  key={`${chain.id}-${index}`}
                  width="full"
                  testId={`rpc-row-item-${index}`}
                >
                  <ContextMenu>
                    <ContextMenuTrigger
                      disabled={
                        mainnetChains[index].name === supportedChain?.name
                      }
                    >
                      <MenuItem
                        first={!supportedChain && index === 0}
                        leftComponent={
                          <ChainBadge chainId={chain.id} size="18" shadow />
                        }
                        onClick={() =>
                          handleRPCClick(chain.rpcUrls.default.http[0])
                        }
                        key={chain.name}
                        rightComponent={
                          chain.rpcUrls.default.http[0] ===
                          rainbowChain.activeRpcUrl ? (
                            <Box
                              alignItems="center"
                              borderRadius="8px"
                              display="flex"
                              justifyContent="center"
                              paddingHorizontal="6px"
                              style={{
                                backgroundColor: `rgba(${chroma(
                                  currentTheme === 'dark'
                                    ? green.dark
                                    : green.light,
                                ).rgb()}, 0.06)`,
                                boxShadow: `0 0 0 1.5px rgba(${chroma(
                                  currentTheme === 'dark'
                                    ? green.dark
                                    : green.light,
                                ).rgb()}, 0.04) inset`,
                                height: 20,
                              }}
                            >
                              <Inline
                                alignHorizontal="center"
                                alignVertical="center"
                                space="3px"
                              >
                                <Box
                                  alignItems="center"
                                  display="flex"
                                  justifyContent="center"
                                >
                                  <Symbol
                                    color="green"
                                    size={9}
                                    symbol="checkmark"
                                    weight="bold"
                                  />
                                </Box>
                                <Text
                                  align="center"
                                  color="green"
                                  size="12pt"
                                  weight="bold"
                                >
                                  {i18n.t(
                                    'settings.networks.custom_rpc.active',
                                  )}
                                </Text>
                              </Inline>
                            </Box>
                          ) : null
                        }
                        titleComponent={<MenuItem.Title text={chain.name} />}
                        labelComponent={
                          <Box paddingRight="8px">
                            <TextOverflow
                              color={'labelTertiary'}
                              size="11pt"
                              weight={'medium'}
                            >
                              {isDefaultRPC(chain)
                                ? i18n.t(
                                    'settings.networks.custom_rpc.rainbow_default_rpc',
                                  )
                                : getDappHost(chain.rpcUrls.default.http[0])}
                            </TextOverflow>
                          </Box>
                        }
                      />
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        symbolLeft="trash.fill"
                        color="red"
                        onSelect={() => handleRemoveRPC(chain)}
                      >
                        <Text color="red" size="14pt" weight="semibold">
                          {i18n.t('settings.networks.custom_rpc.remove_rpc')}
                        </Text>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </Box>
              ))}
            </Box>
          </Menu>
        ) : null}

        {featureFlags.custom_rpc &&
        (activeCustomRPC?.name || supportedChain?.name) ? (
          <>
            <Menu>
              <MenuItem
                first
                last
                leftComponent={
                  <Symbol
                    symbol="plus.circle.fill"
                    weight="medium"
                    size={18}
                    color="blue"
                  />
                }
                onClick={() =>
                  navigate(ROUTES.SETTINGS__NETWORKS__CUSTOM_RPC, {
                    state: {
                      chain: activeCustomRPC || supportedChain,
                      title: i18n.t(
                        'settings.networks.custom_rpc.add_network_rpc',
                        {
                          rpcName:
                            activeCustomRPC?.name || supportedChain?.name,
                        },
                      ),
                    },
                  })
                }
                titleComponent={
                  <MenuItem.Title
                    color="blue"
                    text={i18n.t('settings.networks.custom_rpc.add_rpc')}
                  />
                }
                testId={'custom-rpc-button'}
              />
            </Menu>
            <Separator color="separatorTertiary" strokeWeight="1px" />
          </>
        ) : null}

        {featureFlags.custom_rpc && customNetworkAssetsForChain.length ? (
          <Menu>
            <MenuItem.Description
              color="labelSecondary"
              text={i18n.t('settings.networks.custom_rpc.tokens')}
              weight="bold"
            />
            <Box
              paddingLeft="16px"
              paddingRight="10px"
              paddingVertical="9px"
              width="full"
              testId={'custom-token-section'}
            >
              {customNetworkAssetsForChain?.map((asset, i) => (
                <ContextMenu key={i}>
                  <ContextMenuTrigger>
                    <Inline
                      alignVertical="center"
                      alignHorizontal="center"
                      wrap={false}
                    >
                      <Rows alignVertical="center">
                        <Row>
                          <Columns alignVertical="center" space="10px">
                            <Column width="content">
                              <CoinIcon asset={asset} badge={false} size={24} />
                            </Column>
                            <Column>
                              <Text
                                align="left"
                                color="label"
                                size="14pt"
                                weight="semibold"
                              >
                                {asset.name}
                              </Text>
                            </Column>
                          </Columns>
                        </Row>
                      </Rows>
                      <MoreInfoButton
                        options={options({
                          address: asset.address as Address,
                        })}
                      />
                    </Inline>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      symbolLeft="trash.fill"
                      color="red"
                      onSelect={() =>
                        removeRainbowChainAsset({
                          chainId,
                          address: asset.address as Address,
                        })
                      }
                    >
                      <Text color="red" size="14pt" weight="semibold">
                        {i18n.t('settings.networks.custom_rpc.remove_token')}
                      </Text>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </Box>
          </Menu>
        ) : null}

        {featureFlags.custom_rpc && (
          <>
            <Menu>
              <MenuItem
                testId={'custom-token-link'}
                first
                last
                leftComponent={
                  <Symbol
                    color="blue"
                    symbol="plus.circle.fill"
                    weight="medium"
                    size={18}
                  />
                }
                onClick={() =>
                  navigate(ROUTES.SETTINGS__NETWORKS__CUSTOM_RPC__DETAILS, {
                    state: {
                      chainId,
                    },
                  })
                }
                titleComponent={
                  <MenuItem.Title
                    color="blue"
                    text={i18n.t('settings.networks.custom_rpc.add_asset')}
                  />
                }
              />
            </Menu>
            <Separator color="separatorTertiary" strokeWeight="1px" />
          </>
        )}

        {developerToolsEnabled && testnetChains.length ? (
          <>
            <Menu>
              <MenuItem.Description
                color="labelSecondary"
                text={i18n.t('settings.networks.testnets')}
                weight="bold"
              />
              <Box paddingHorizontal="1px" paddingVertical="1px">
                {testnetChains.map((chain, index) => (
                  <Box
                    key={`${chain.name}`}
                    testId={`network-row-${chain.name}`}
                  >
                    <ContextMenu>
                      <ContextMenuTrigger>
                        <MenuItem
                          first={!supportedChain && index === 0}
                          leftComponent={
                            <ChainBadge chainId={chain.id} size="18" shadow />
                          }
                          key={chain.name}
                          titleComponent={<MenuItem.Title text={chain.name} />}
                          labelComponent={
                            <Text
                              color={'labelTertiary'}
                              size="11pt"
                              weight={'medium'}
                            >
                              {chainIdMap[chainId]?.includes(chain.id) &&
                              chain.id !== chainId
                                ? i18n.t(
                                    'settings.networks.custom_rpc.rainbow_default',
                                  )
                                : chain.rpcUrls.default.http[0]}
                            </Text>
                          }
                        />
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem
                          symbolLeft="trash.fill"
                          color="red"
                          onSelect={() => handleRemoveRPC(chain)}
                        >
                          <Text color="red" size="14pt" weight="semibold">
                            {i18n.t('settings.networks.custom_rpc.remove_rpc')}
                          </Text>
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  </Box>
                ))}
              </Box>
            </Menu>
            <Separator color="separatorTertiary" strokeWeight="1px" />
          </>
        ) : null}

        {!SUPPORTED_CHAIN_IDS.includes(chainId) ? (
          <Menu>
            <MenuItem
              first
              last
              leftComponent={
                <Symbol
                  symbol="trash.fill"
                  weight="medium"
                  size={18}
                  color="red"
                />
              }
              onClick={() => handleRemoveNetwork({ chainId })}
              titleComponent={
                <MenuItem.Title
                  color="red"
                  text={i18n.t('settings.networks.custom_rpc.remove_network')}
                />
              }
            />
          </Menu>
        ) : null}
      </MenuContainer>
    </Box>
  );
}
