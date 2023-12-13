import React, { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Address, Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { SUPPORTED_CHAINS } from '~/core/references';
import { selectUserAssetsDictByChain } from '~/core/resources/_selectors/assets';
import { useCustomNetworkAssets } from '~/core/resources/assets/customNetworkAssets';
import {
  useCurrentAddressStore,
  useCurrentCurrencyStore,
  useCustomRPCsStore,
} from '~/core/state';
import { useDeveloperToolsEnabledStore } from '~/core/state/currentSettings/developerToolsEnabled';
import { useCustomRPCAssetsStore } from '~/core/state/customRPCAssets';
import { useUserChainsStore } from '~/core/state/userChains';
import {
  getCustomChains,
  getSupportedTestnetChains,
} from '~/core/utils/chains';
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
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const {
    state: { chainId },
  } = useLocation();
  const { removeCustomRPCAsset } = useCustomRPCAssetsStore();

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
  const { customChains, setActiveRPC, setDefaultRPC, removeCustomRPC } =
    useCustomRPCsStore();

  const customChain = customChains[Number(chainId)];

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
    (rpcUrl?: string): void => {
      if (rpcUrl) {
        setActiveRPC({
          rpcUrl,
          chainId: chainId,
        });
      } else {
        setDefaultRPC({ chainId });
      }
    },
    [chainId, setActiveRPC, setDefaultRPC],
  );

  const handleTestnetClick = useCallback((rpcUrl: string): void => {
    console.log('rpcUrl', rpcUrl);
  }, []);

  const suportedChain = useMemo(
    () => SUPPORTED_CHAINS.find(({ id }) => id === chainId),
    [chainId],
  );

  const isDefaultRPC = () => {
    const { customChains: chains } = getCustomChains();
    const customChain = chains.find(
      (chain: Chain) => chain.id === (chainId as number),
    );
    return typeof customChain === 'undefined';
  };

  const mainnetChains =
    customChains[Number(chainId)]?.chains?.filter((chain) => !chain.testnet) ||
    [];
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

  const customTestnetChains =
    customChains[Number(chainId)]?.chains?.filter((chain) => chain.testnet) ||
    [];
  const supportedTestnetChains = getSupportedTestnetChains().filter((chain) => {
    return chainIdMap[chainId]?.includes(chain.id) && chain.id !== chainId;
  });

  const testnetChains = [...customTestnetChains, ...supportedTestnetChains];

  console.log(
    '-- activeCustomRPC?.name || suportedChain?.name',
    activeCustomRPC?.name || suportedChain?.name,
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
                testId="set-rainbow-default-toggle"
                checked={userChains[chainId]}
                handleChange={handleToggleChain}
                tabIndex={-1}
              />
            }
            onToggle={() => handleToggleChain(!userChains[chainId])}
          />
        </Menu>
        <Menu>
          <MenuItem.Description
            text={i18n.t('settings.networks.rpc_endpoints')}
          />
          <Box paddingHorizontal="1px" paddingVertical="1px">
            {suportedChain && (
              <MenuItem
                first={true}
                leftComponent={
                  <ChainBadge chainId={chainId} size="18" shadow />
                }
                onClick={() => handleRPCClick('')}
                key={'default'}
                rightComponent={
                  isDefaultRPC() ? <MenuItem.SelectionIcon /> : null
                }
                titleComponent={<MenuItem.Title text={'Default'} />}
                labelComponent={
                  <Text color={'labelTertiary'} size="11pt" weight={'medium'}>
                    {`Rainbow's default RPC`}
                  </Text>
                }
              />
            )}
            {mainnetChains.map((chain, index) => (
              <Box key={`${chain.name}`} width="full">
                <ContextMenu>
                  <ContextMenuTrigger>
                    <MenuItem
                      first={!suportedChain && index === 0}
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
                        <Text
                          color={'labelTertiary'}
                          size="11pt"
                          weight={'medium'}
                        >
                          {chain.rpcUrls.default.http[0]}
                        </Text>
                      }
                    />
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      symbolLeft="trash.fill"
                      color="red"
                      onSelect={() =>
                        removeCustomRPC({
                          rpcUrl: chain.rpcUrls.default.http[0],
                        })
                      }
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

        {(activeCustomRPC?.name || suportedChain?.name) && (
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
                    chain: activeCustomRPC || suportedChain,
                  },
                })
              }
              titleComponent={
                <MenuItem.Title
                  text={i18n.t('settings.networks.custom_rpc.add_rpc', {
                    rpcName: activeCustomRPC?.name || suportedChain?.name,
                  })}
                />
              }
            />
          </Menu>
        )}

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
        {developerToolsEnabled && testnetChains.length && (
          <Menu>
            <MenuItem.Description text={i18n.t('settings.networks.testnets')} />
            <Box paddingHorizontal="1px" paddingVertical="1px">
              {testnetChains.map((chain, index) => (
                <Box key={`${chain.name}`} testId={`network-row-${chain.name}`}>
                  <MenuItem
                    first={!suportedChain && index === 0}
                    leftComponent={
                      <ChainBadge chainId={chain.id} size="18" shadow />
                    }
                    onClick={() =>
                      handleTestnetClick(chain.rpcUrls.default.http[0])
                    }
                    key={chain.name}
                    rightComponent={
                      chain.rpcUrls.default.http[0] ===
                      customChains[Number(chainId)]?.activeRpcUrl ? (
                        <MenuItem.SelectionIcon />
                      ) : null
                    }
                    titleComponent={<MenuItem.Title text={chain.name} />}
                    labelComponent={
                      <Text
                        color={'labelTertiary'}
                        size="11pt"
                        weight={'medium'}
                      >
                        {chainIdMap[chainId].includes(chain.id) &&
                        chain.id !== chainId
                          ? `Rainbow's default`
                          : chain.rpcUrls.default.http[0]}
                      </Text>
                    }
                  />
                </Box>
              ))}
            </Box>
          </Menu>
        )}
      </MenuContainer>

      {Object.values(customNetworkAssetsForChain || {}).length && (
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
      )}
    </Box>
  );
}
