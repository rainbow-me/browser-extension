import React, { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Address, Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { SUPPORTED_CHAINS, getDefaultRPC } from '~/core/references';
import { selectUserAssetsDictByChain } from '~/core/resources/_selectors/assets';
import { useCustomNetworkAssets } from '~/core/resources/assets/customNetworkAssets';
import {
  useCurrentAddressStore,
  useCurrentCurrencyStore,
  useRainbowChainsStore,
} from '~/core/state';
import { useDeveloperToolsEnabledStore } from '~/core/state/currentSettings/developerToolsEnabled';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useCustomRPCAssetsStore } from '~/core/state/customRPCAssets';
import { useUserChainsStore } from '~/core/state/userChains';
import { getSupportedTestnetChains } from '~/core/utils/chains';
import { chainIdMap } from '~/core/utils/userChains';
import {
  Box,
  Column,
  Columns,
  Inline,
  Inset,
  Row,
  Rows,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
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
import { RowHighlightWrapper } from '../send/RowHighlightWrapper';

export function SettingsNetworksRPCs() {
  const { featureFlags } = useFeatureFlagsStore();
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const {
    state: { chainId },
  } = useLocation();
  const { removeCustomRPCAsset, removeCustomRPCAssets } =
    useCustomRPCAssetsStore();

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

  const customNetworkAssetsForChain = customNetworkAssets?.[chainId];

  const navigate = useRainbowNavigate();
  const { developerToolsEnabled } = useDeveloperToolsEnabledStore();
  const { rainbowChains, setActiveRPC, removeCustomRPC } =
    useRainbowChainsStore();

  const customChain = rainbowChains[Number(chainId)];

  const activeCustomRPC = customChain?.chains.find(
    (chain) => chain.rpcUrls.default.http[0] === customChain.activeRpcUrl,
  );

  const { userChains, updateUserChain } = useUserChainsStore();

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

  const isDefaultRPC = ({
    rpcUrl,
    chainId,
  }: {
    rpcUrl: string;
    chainId: number;
  }) => {
    const defaultRPC = getDefaultRPC(chainId);
    if (!defaultRPC) return false;
    return rpcUrl === defaultRPC.http;
  };

  const mainnetChains = useMemo(
    () =>
      rainbowChains[Number(chainId)]?.chains
        ?.filter((chain) => !chain.testnet, [chainId, rainbowChains])
        .sort((a, b) => {
          if (
            isDefaultRPC({
              chainId: a.id,
              rpcUrl: a.rpcUrls.default.http[0],
            })
          )
            return -1;
          if (
            isDefaultRPC({
              chainId: b.id,
              rpcUrl: b.rpcUrls.default.http[0],
            })
          )
            return 1;
          return 0;
        }),
    [chainId, rainbowChains],
  );

  const options = ({ address }: { address: Address }): MoreInfoOption[] => [
    {
      label: i18n.t('settings.networks.custom_rpc.remove_token'),
      color: 'red',
      symbol: 'trash.fill',
      onSelect: () =>
        removeCustomRPCAsset({
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
    const supportedTestnetChains = getSupportedTestnetChains().filter(
      (chain) => {
        return chainIdMap[chainId]?.includes(chain.id) && chain.id !== chainId;
      },
    );
    return [...customTestnetChains, ...supportedTestnetChains];
  }, [chainId, rainbowChains]);

  const handleRemoveRPC = useCallback(
    (chain: Chain) => {
      const allChainsCount = [...mainnetChains, ...testnetChains].length;
      removeCustomRPC({
        rpcUrl: chain.rpcUrls.default.http[0],
      });
      // If there's no default chain & only had one chain, go back
      if (!supportedChain && allChainsCount === 1) {
        navigate(-1);
      }
    },
    [mainnetChains, navigate, removeCustomRPC, supportedChain, testnetChains],
  );

  const handleRemoveNetwork = useCallback(
    ({ chainId }: { chainId: number }) => {
      const customChain = customChains[chainId];
      if (customChain) {
        customChain.chains.forEach((chain) => {
          removeCustomRPC({
            rpcUrl: chain.rpcUrls.default.http[0],
          });
          removeCustomRPCAssets({ chainId });
        });
      }
    },
    [customChains, removeCustomRPC, removeCustomRPCAssets],
  );

  return (
    <Box paddingHorizontal="20px" paddingBottom="20px">
      <MenuContainer testId="settings-menu-container">
        <Menu>
          <MenuItem
            first
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
        {supportedChain || mainnetChains.length ? (
          <Menu>
            <MenuItem.Description
              text={i18n.t('settings.networks.rpc_endpoints')}
            />
            <Box paddingHorizontal="1px" paddingVertical="1px">
              {mainnetChains.map((chain, index) => (
                <Box key={`${chain.name}`} width="full">
                  <ContextMenu>
                    <ContextMenuTrigger>
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
                          customChain.activeRpcUrl ? (
                            <MenuItem.SelectionIcon />
                          ) : null
                        }
                        titleComponent={<MenuItem.Title text={chain.name} />}
                        labelComponent={
                          <TextOverflow
                            color={'labelTertiary'}
                            size="11pt"
                            weight={'medium'}
                          >
                            {isDefaultRPC({
                              chainId: chain.id,
                              rpcUrl: chain.rpcUrls.default.http[0],
                            })
                              ? i18n.t(
                                  'settings.networks.custom_rpc.rainbow_default_rpc',
                                )
                              : chain.rpcUrls.default.http[0]}
                          </TextOverflow>
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
          <Menu>
            <MenuItem
              first
              last
              leftComponent={
                <Symbol
                  symbol="plus.circle.fill"
                  weight="medium"
                  size={18}
                  color="accent"
                />
              }
              hasRightArrow
              onClick={() =>
                navigate(ROUTES.SETTINGS__NETWORKS__CUSTOM_RPC, {
                  state: {
                    chain: activeCustomRPC || supportedChain,
                    title: i18n.t('settings.networks.custom_rpc.add_rpc', {
                      rpcName: activeCustomRPC?.name || supportedChain?.name,
                    }),
                  },
                })
              }
              titleComponent={
                <MenuItem.Title
                  text={i18n.t('settings.networks.custom_rpc.add_rpc', {
                    rpcName: supportedChain?.name || activeCustomRPC?.name,
                  })}
                />
              }
            />
          </Menu>
        ) : null}

        {featureFlags.custom_rpc && (
          <Menu>
            <MenuItem
              testId={'custom-chain-link'}
              first
              last
              leftComponent={
                <Symbol
                  symbol="plus.circle.fill"
                  weight="medium"
                  size={18}
                  color="accent"
                />
              }
              hasRightArrow
              onClick={() =>
                navigate(ROUTES.SETTINGS__NETWORKS__CUSTOM_RPC__DETAILS, {
                  state: {
                    chainId,
                  },
                })
              }
              titleComponent={
                <MenuItem.Title
                  text={i18n.t('settings.networks.custom_rpc.add_asset')}
                />
              }
            />
          </Menu>
        )}
        {developerToolsEnabled && testnetChains.length ? (
          <Menu>
            <MenuItem.Description text={i18n.t('settings.networks.testnets')} />
            <Box paddingHorizontal="1px" paddingVertical="1px">
              {testnetChains.map((chain, index) => (
                <Box key={`${chain.name}`} testId={`network-row-${chain.name}`}>
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
        ) : null}
      </MenuContainer>

      {featureFlags.custom_rpc &&
      Object.values(customNetworkAssetsForChain || {}).length ? (
        <Menu>
          <Box padding="20px">
            <Stack space="14px">
              <Text align="left" color="label" size="14pt" weight="medium">
                {i18n.t('settings.networks.custom_rpc.tokens')}
              </Text>

              <Box width="full">
                {Object.values(customNetworkAssetsForChain || {})?.map(
                  (asset, i) => (
                    <ContextMenu key={i}>
                      <ContextMenuTrigger>
                        <Box marginHorizontal="-12px">
                          <RowHighlightWrapper>
                            <Inline
                              alignVertical="center"
                              alignHorizontal="center"
                              wrap={false}
                            >
                              <Box style={{ height: '52px' }} width="full">
                                <Inset horizontal="12px" vertical="8px">
                                  <Rows>
                                    <Row>
                                      <Columns
                                        alignVertical="center"
                                        space="8px"
                                      >
                                        <Column width="content">
                                          <CoinIcon asset={asset} />
                                        </Column>
                                        <Column>
                                          <Text
                                            align="left"
                                            color="label"
                                            size="14pt"
                                            weight="medium"
                                          >
                                            {asset.name}
                                          </Text>
                                        </Column>
                                      </Columns>
                                    </Row>
                                  </Rows>
                                </Inset>
                              </Box>
                              <MoreInfoButton
                                options={options({
                                  address: asset.address as Address,
                                })}
                              />
                            </Inline>
                          </RowHighlightWrapper>
                        </Box>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem
                          symbolLeft="trash.fill"
                          color="red"
                          onSelect={() =>
                            removeCustomRPCAsset({
                              chainId,
                              address: asset.address as Address,
                            })
                          }
                        >
                          <Text color="red" size="14pt" weight="semibold">
                            {i18n.t(
                              'settings.networks.custom_rpc.remove_token',
                            )}
                          </Text>
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ),
                )}
              </Box>
            </Stack>
          </Box>
        </Menu>
      ) : null}
      <Menu>
        <MenuItem
          first
          last
          leftComponent={
            <Symbol symbol="trash.fill" weight="medium" size={18} color="red" />
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
    </Box>
  );
}
