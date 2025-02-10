import { useCallback, useMemo } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { Chain } from 'viem';

import { i18n } from '~/core/languages';
import { useDeveloperToolsEnabledStore } from '~/core/state/currentSettings/developerToolsEnabled';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { networkStore } from '~/core/state/networks/networks';
import { promoTypes, useQuickPromoStore } from '~/core/state/quickPromo';
import { useRainbowChainAssetsStore } from '~/core/state/rainbowChainAssets';
import { ChainId } from '~/core/types/chains';
import { useMainChains } from '~/core/utils/chains';
import { chainLabelMap, sortNetworks } from '~/core/utils/userChains';
import { Box, Inset, Separator, Symbol, Text } from '~/design-system';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

import { ChainBadge } from '../../components/ChainBadge/ChainBadge';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../../components/ContextMenu/ContextMenu';
import { DraggableContext, DraggableItem } from '../../components/Draggable';
import { QuickPromo } from '../../components/QuickPromo/QuickPromo';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

const chainLabel = ({
  chainId,
  testnet,
}: {
  chainId: ChainId;
  testnet?: boolean;
}) => {
  const chainLabels = [
    testnet
      ? i18n.t('settings.networks.testnet')
      : i18n.t('settings.networks.mainnet'),
  ];
  if (chainLabelMap[chainId]) {
    chainLabels.push(...chainLabelMap[chainId]);
  }
  return chainLabels.join(', ');
};

export function SettingsNetworks() {
  const navigate = useRainbowNavigate();
  const mainChains = useMainChains();
  const { seenPromos, setSeenPromo } = useQuickPromoStore();
  const { developerToolsEnabled, setDeveloperToolsEnabled } =
    useDeveloperToolsEnabledStore();
  const { featureFlags } = useFeatureFlagsStore();
  const removeCustomChain = networkStore((state) => state.removeCustomChain);
  const allChains = networkStore((state) => state.getAllChains());
  const { chainOrder, enabledChainIds } = networkStore((state) => ({
    chainOrder: state.chainOrder,
    enabledChainIds: state.enabledChainIds,
  }));
  const { removeRainbowChainAssets } = useRainbowChainAssetsStore();
  const supportedChains = networkStore((state) =>
    state.getBackendSupportedChains(true),
  );

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!seenPromos[promoTypes.network_settings])
      setSeenPromo(promoTypes.network_settings);
    if (!destination) return;
    if (destination.index === source.index) return;
    networkStore.getState().updateChainOrder(source.index, destination.index);
  };

  const allNetworks = useMemo(
    () =>
      sortNetworks(chainOrder, mainChains).map((chain) => {
        const chainId = chain.id;
        // Always use the name of the supported network if it exists
        return {
          ...chain,
          name: supportedChains[chainId]?.name || chain.name,
        };
      }),
    [mainChains, chainOrder, supportedChains],
  );

  console.log(mainChains, allChains, allNetworks);

  const enableNetwork = useCallback(
    ({ chainId, enabled }: { chainId: number; enabled: boolean }) => {
      networkStore.getState().updateEnabledChains([chainId], enabled);
    },
    [],
  );

  const handleRemoveNetwork = useCallback(
    ({ chainId }: { chainId: number }) => {
      const chain = allChains[chainId];
      if (chain.type === 'custom') {
        const removed = removeCustomChain(chainId);
        if (removed) {
          removeRainbowChainAssets({ chainId });
        }
      }
    },
    [removeCustomChain, removeRainbowChainAssets, allChains],
  );

  return (
    <Box paddingHorizontal="20px">
      {featureFlags.custom_rpc && (
        <MenuContainer>
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
                  color="blue"
                />
              }
              onClick={() =>
                navigate(ROUTES.SETTINGS__NETWORKS__CUSTOM_RPC, {
                  state: {
                    title: i18n.t(
                      'settings.networks.custom_rpc.add_custom_network',
                    ),
                  },
                })
              }
              titleComponent={
                <MenuItem.Title
                  color="blue"
                  text={i18n.t(
                    'settings.networks.custom_rpc.add_custom_network',
                  )}
                />
              }
            />
          </Menu>
        </MenuContainer>
      )}

      {!seenPromos[promoTypes.network_settings] && (
        <Inset bottom="20px">
          <QuickPromo
            text={i18n.t('settings.networks.quick_promo.text')}
            textBold={i18n.t('settings.networks.quick_promo.text_bold')}
            symbol="sparkle"
            symbolColor="accent"
            promoType="network_settings"
          />
        </Inset>
      )}

      <MenuContainer testId="network-settings-menu-container">
        <Menu>
          <DraggableContext onDragEnd={onDragEnd} height="fixed">
            <Box>
              {allNetworks.map((chain: Chain, index) => (
                <Box
                  alignItems="center"
                  justifyContent="center"
                  key={`${chain.id}`}
                  testId={`network-row-${chain.id}`}
                  width="full"
                >
                  <DraggableItem
                    borderRadius={14}
                    id={`${chain.id}`}
                    index={index}
                    padding="2px"
                  >
                    <Box
                      alignItems="center"
                      justifyContent="center"
                      position="relative"
                    >
                      <ContextMenu>
                        <ContextMenuTrigger>
                          <MenuItem
                            disabled={!enabledChainIds.has(chain.id)}
                            first={index === 0}
                            leftComponent={
                              <ChainBadge chainId={chain.id} size="18" shadow />
                            }
                            onClick={() =>
                              navigate(ROUTES.SETTINGS__NETWORKS__RPCS, {
                                state: {
                                  chainId: chain.id,
                                  title: chain.name,
                                },
                              })
                            }
                            paddingHorizontal="14px"
                            key={chain.id}
                            hasRightArrow
                            titleComponent={
                              <MenuItem.Title text={chain.name} />
                            }
                            labelComponent={
                              developerToolsEnabled ||
                              !enabledChainIds.has(chain.id) ? (
                                <Text
                                  color="labelQuaternary"
                                  size="11pt"
                                  weight="medium"
                                >
                                  {enabledChainIds.has(chain.id)
                                    ? chainLabel({
                                        chainId: chain.id,
                                        testnet: chain.testnet,
                                      })
                                    : i18n.t('settings.networks.disabled')}
                                </Text>
                              ) : null
                            }
                          />
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            symbolLeft={'switch.2'}
                            onSelect={() =>
                              enableNetwork({
                                chainId: chain.id,
                                enabled: !enabledChainIds.has(chain.id),
                              })
                            }
                          >
                            <Text size="14pt" weight="semibold">
                              {enabledChainIds.has(chain.id)
                                ? i18n.t('settings.networks.disable')
                                : i18n.t('settings.networks.enable')}
                            </Text>
                          </ContextMenuItem>
                          {!supportedChains[chain.id] ? (
                            <ContextMenuItem
                              symbolLeft="trash.fill"
                              color="red"
                              onSelect={() =>
                                handleRemoveNetwork({ chainId: chain.id })
                              }
                            >
                              <Text color="red" size="14pt" weight="semibold">
                                {i18n.t(
                                  'settings.networks.custom_rpc.remove_network',
                                )}
                              </Text>
                            </ContextMenuItem>
                          ) : null}
                        </ContextMenuContent>
                      </ContextMenu>
                      {index !== allNetworks.length - 1 && (
                        <Box
                          paddingHorizontal="14px"
                          position="absolute"
                          style={{
                            bottom: -2.5,
                            height: 1,
                            overflow: 'visible',
                          }}
                          width="full"
                        >
                          <Separator
                            color="separatorTertiary"
                            strokeWeight="1px"
                          />
                        </Box>
                      )}
                    </Box>
                  </DraggableItem>
                </Box>
              ))}
            </Box>
          </DraggableContext>
          <Box paddingHorizontal="16px" paddingVertical="16px">
            <Text size="12pt" weight="medium" color="labelTertiary">
              {i18n.t('settings.networks.description')}
            </Text>
          </Box>
        </Menu>
        <Menu>
          <MenuItem
            leftComponent={
              <Symbol
                symbol="hammer.fill"
                weight="medium"
                size={18}
                color="labelTertiary"
              />
            }
            titleComponent={
              <MenuItem.Title
                text={i18n.t('settings.networks.developer_tools.title')}
              />
            }
            rightComponent={
              <Toggle
                testId="developer-tools-toggle"
                checked={developerToolsEnabled}
                handleChange={() =>
                  setDeveloperToolsEnabled(!developerToolsEnabled)
                }
                tabIndex={-1}
              />
            }
            onToggle={() => setDeveloperToolsEnabled(!developerToolsEnabled)}
          />
          <MenuItem.Description
            text={i18n.t('settings.networks.developer_tools.toggle_explainer')}
          />
        </Menu>
      </MenuContainer>
    </Box>
  );
}
