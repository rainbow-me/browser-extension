import chroma from 'chroma-js';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Address, Chain } from 'viem';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { selectUserAssetsDictByChain } from '~/core/resources/_selectors/assets';
import { useCustomNetworkAssets } from '~/core/resources/assets/customNetworkAssets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useDeveloperToolsEnabledStore } from '~/core/state/currentSettings/developerToolsEnabled';
import { useNetworkStore } from '~/core/state/networks/networks';
import { transformBackendNetworkToChain } from '~/core/state/networks/utils';
import { useRainbowChainAssetsStore } from '~/core/state/rainbowChainAssets';
import { TransformedChain } from '~/core/types/chains';
import { getDappHost } from '~/core/utils/connectedApps';
import {
  Box,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
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

const isDefaultRPC = (
  chain: Chain,
  backendSupportedChains: Record<number, TransformedChain>,
) => {
  const defaultBackendRpc =
    backendSupportedChains[chain.id]?.rpcUrls?.default?.http?.[0];
  if (!defaultBackendRpc) return false;
  return chain.rpcUrls.default.http[0] === defaultBackendRpc;
};

export function SettingsNetworksRPCs() {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { currentTheme } = useCurrentThemeStore();
  const {
    state: { chainId },
  } = useLocation();
  const { removeRainbowChainAsset, removeRainbowChainAssets } =
    useRainbowChainAssetsStore();

  const supportedChains = useNetworkStore((state) =>
    state.getBackendSupportedChains(true),
  );
  const supportedChain = supportedChains[chainId];

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
  const selectRpcForChain = useNetworkStore((state) => state.selectRpcForChain);
  const updateEnabledChains = useNetworkStore(
    (state) => state.updateEnabledChains,
  );
  const enabledChainIds = useNetworkStore((state) => state.enabledChainIds);
  const chain = useNetworkStore((state) => state.getChain(chainId));
  const chainsByMainnetId = useNetworkStore((state) =>
    state.getBackendChainsByMainnetId(),
  );
  const chainIdsByMainnetId = useNetworkStore((state) =>
    state.getBackendChainIdsByMainnetId(),
  );
  const activeChain = chain?.rpcs[chain.activeRpcUrl];

  const mainnetChains =
    Object.values(chain?.rpcs || {})
      .filter((chain) => !chain.testnet)
      .sort((a, b) => {
        if (isDefaultRPC(a, supportedChains)) return -1;
        if (isDefaultRPC(b, supportedChains)) return 1;
        return 0;
      }) || [];

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

  const supportedTestnetChains =
    chainsByMainnetId[chainId]
      ?.filter((c) => c.id !== chainId)
      .map((c) => transformBackendNetworkToChain(c)) || [];

  const testnetChains = () => {
    const customTestnetChains =
      Object.values(chain?.rpcs || {}).filter((chain) => chain.testnet) || [];

    return [...customTestnetChains, ...supportedTestnetChains];
  };

  const handleRemoveRPC = useCallback(
    (chain: Chain) => {
      const chainId = chain.id;
      const { success, newRpcsLength } = useNetworkStore
        .getState()
        .removeRpcFromChain(chainId, chain.rpcUrls.default.http[0]);
      if (!success) return;

      removeRainbowChainAssets({ chainId });
      if (!supportedChain && newRpcsLength === 0) {
        navigate(-1);
      }
    },
    [navigate, removeRainbowChainAssets, supportedChain],
  );

  const handleRemoveNetwork = useCallback(
    ({ chainId }: { chainId: number }) => {
      const removed = useNetworkStore.getState().removeCustomChain(chainId);
      if (removed) {
        removeRainbowChainAssets({ chainId });
        navigate(-1);
      }
    },
    [navigate, removeRainbowChainAssets],
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
                checked={enabledChainIds.has(chainId)}
                handleChange={(newVal: boolean) =>
                  updateEnabledChains([chainId], newVal)
                }
                tabIndex={-1}
              />
            }
            onToggle={() =>
              updateEnabledChains([chainId], !enabledChainIds.has(chainId))
            }
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
              {mainnetChains.map((mainnetChain, index) => (
                <Box
                  key={`${mainnetChain.id}-${index}`}
                  width="full"
                  testId={`rpc-row-item-${index}`}
                >
                  <ContextMenu>
                    <ContextMenuTrigger
                      disabled={
                        supportedChain?.rpcUrls.default.http[0] ===
                        mainnetChain.rpcUrls.default.http[0]
                      }
                    >
                      <MenuItem
                        first={!supportedChain && index === 0}
                        leftComponent={
                          <ChainBadge
                            chainId={mainnetChain.id}
                            size="18"
                            shadow
                          />
                        }
                        onClick={() =>
                          selectRpcForChain(
                            chainId,
                            mainnetChain.rpcUrls.default.http[0],
                          )
                        }
                        key={mainnetChain.name}
                        rightComponent={
                          mainnetChain.rpcUrls.default.http[0] ===
                          chain?.activeRpcUrl ? (
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
                        titleComponent={
                          <MenuItem.Title text={mainnetChain.name} />
                        }
                        labelComponent={
                          <Box paddingRight="8px">
                            <TextOverflow
                              color={'labelTertiary'}
                              size="11pt"
                              weight={'medium'}
                            >
                              {isDefaultRPC(mainnetChain, supportedChains)
                                ? i18n.t(
                                    'settings.networks.custom_rpc.rainbow_default_rpc',
                                  )
                                : getDappHost(
                                    mainnetChain.rpcUrls.default.http[0],
                                  )}
                            </TextOverflow>
                          </Box>
                        }
                      />
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        symbolLeft="trash.fill"
                        color="red"
                        onSelect={() => handleRemoveRPC(mainnetChain)}
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
            {config.custom_rpc_enabled &&
            (activeChain?.name || supportedChain?.name) ? (
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
                      chain: activeChain || supportedChain,
                      title: i18n.t(
                        'settings.networks.custom_rpc.add_network_rpc',
                        {
                          rpcName: activeChain?.name || supportedChain?.name,
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
            ) : null}
          </Menu>
        ) : null}

        {config.custom_rpc_enabled && customNetworkAssetsForChain.length ? (
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

        {config.custom_rpc_enabled && (
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
          </>
        )}

        {developerToolsEnabled && testnetChains().length ? (
          <>
            <Menu>
              <MenuItem.Description
                color="labelSecondary"
                text={i18n.t('settings.networks.testnets')}
                weight="bold"
              />
              <Box paddingHorizontal="1px" paddingVertical="1px">
                {testnetChains().map((chain, index) => (
                  <Box
                    key={`${chain.name}`}
                    testId={`network-row-${chain.name}`}
                  >
                    <ContextMenu>
                      <ContextMenuTrigger
                        disabled={
                          supportedTestnetChains.find(
                            (testNetChain) => testNetChain.id === chain.id,
                          )?.rpcUrls.default.http[0] ===
                          chain.rpcUrls.default.http[0]
                        }
                      >
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
                              {chainIdsByMainnetId[chainId]?.includes(
                                chain.id,
                              ) && chain.id !== chainId
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
          </>
        ) : null}

        {!supportedChains[chainId] ? (
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
