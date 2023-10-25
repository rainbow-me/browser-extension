import React, { useCallback } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useUserChainsStore } from '~/core/state/userChains';
import { ChainId } from '~/core/types/chains';
import { getSupportedChains } from '~/core/utils/chains';
import { reorder } from '~/core/utils/draggable';
import {
  chainIdMap,
  chainLabelMap,
  sortNetworks,
} from '~/core/utils/userChains';
import { Box, Inset, Symbol, Text } from '~/design-system';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

import { ChainBadge } from '../../components/ChainBadge/ChainBadge';
import { DraggableContext, DraggableItem } from '../../components/Draggable';
import { QuickPromo } from '../../components/QuickPromo/QuickPromo';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

const chainLabel = ({ chainId }: { chainId: ChainId }) => {
  const chainLabels = [i18n.t('settings.networks.mainnet')];
  if (chainLabelMap[chainId]) {
    chainLabels.push(...chainLabelMap[chainId]);
  }
  return chainLabels.join(', ');
};

export function SettingsNetworksCustomRPC() {
  const navigate = useRainbowNavigate();
  const {
    userChains,
    updateUserChains,
    userChainsOrder,
    updateUserChainsOrder,
  } = useUserChainsStore();
  const supportedChains = getSupportedChains();
  const {
    testnetMode,
    testnetModeShortcutEnabled,
    setTestnetMode,
    setTestnetModeShortcutEnabled,
  } = useTestnetModeStore();

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.index === source.index) return;
    const newUserChainsOrder = reorder(
      userChainsOrder,
      source.index,
      destination.index,
    );
    updateUserChainsOrder({ userChainsOrder: newUserChainsOrder });
  };

  const updateChain = useCallback(
    (chain: Chain) => {
      const chainIdsToUpdate = chainIdMap[chain.id];
      updateUserChains({
        chainIds: chainIdsToUpdate,
        enabled: !userChains[chain.id],
      });
    },
    [updateUserChains, userChains],
  );

  return (
    <Box paddingHorizontal="20px">
      <Inset bottom="8px">
        <QuickPromo
          text={i18n.t('settings.networks.quick_promo.text')}
          textBold={i18n.t('settings.networks.quick_promo.text_bold')}
          symbol="sparkle"
          symbolColor="accent"
          promoType="network_settings"
        />
      </Inset>

      <MenuContainer testId="settings-menu-container">
        <Menu>
          <DraggableContext onDragEnd={onDragEnd} height="fixed">
            <Box paddingHorizontal="1px" paddingVertical="1px">
              {sortNetworks(userChainsOrder, supportedChains).map(
                (chain: Chain, index) => (
                  <Box key={`${chain.id}`} testId={`network-row-${chain.id}`}>
                    <DraggableItem id={`${chain.id}`} index={index}>
                      <MenuItem
                        first={index === 0}
                        leftComponent={
                          <ChainBadge chainId={chain.id} size="18" shadow />
                        }
                        rightComponent={
                          userChains[chain.id] ? (
                            <MenuItem.SelectionIcon />
                          ) : null
                        }
                        key={chain.name}
                        titleComponent={<MenuItem.Title text={chain.name} />}
                        labelComponent={
                          <Text
                            color={'labelTertiary'}
                            size="11pt"
                            weight={'medium'}
                          >
                            {chainLabel({ chainId: chain.id })}
                          </Text>
                        }
                        onClick={() => updateChain(chain)}
                      />
                    </DraggableItem>
                  </Box>
                ),
              )}
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
            testId={'custom-rpc-link'}
            first
            last
            leftComponent={
              <Symbol
                symbol="network"
                weight="medium"
                size={18}
                color="green"
              />
            }
            hasRightArrow
            onClick={() => navigate(ROUTES.SETTINGS__NETWORKS__CUSTOM_RPC)}
            titleComponent={
              <MenuItem.Title
                text={i18n.t('settings.networks.custom_rpc.title')}
              />
            }
          />
        </Menu>
        <Menu>
          <MenuItem
            first
            leftComponent={<MenuItem.TextIcon icon="🕹" />}
            titleComponent={
              <MenuItem.Title
                text={i18n.t('settings.networks.testnet_mode.title')}
              />
            }
            rightComponent={
              <Toggle
                testId="testnet-mode-toggle"
                checked={testnetMode}
                handleChange={() => setTestnetMode(!testnetMode)}
                tabIndex={-1}
              />
            }
            onToggle={() => setTestnetMode(!testnetMode)}
          />
          <MenuItem.Description
            text={i18n.t('settings.networks.testnet_mode.toggle_explainer')}
          />
          <MenuItem
            leftComponent={
              <Symbol
                symbol="switch.2"
                weight="medium"
                size={18}
                color="labelTertiary"
              />
            }
            titleComponent={
              <MenuItem.Title
                text={i18n.t('settings.networks.testnet_mode.shortcut_title')}
              />
            }
            rightComponent={
              <Toggle
                testId="testnet-mode-shortcut-toggle"
                checked={testnetModeShortcutEnabled}
                handleChange={() =>
                  setTestnetModeShortcutEnabled(!testnetModeShortcutEnabled)
                }
                tabIndex={-1}
              />
            }
            onToggle={() =>
              setTestnetModeShortcutEnabled(!testnetModeShortcutEnabled)
            }
          />
          <MenuItem.Description
            text={i18n.t(
              'settings.networks.testnet_mode.shortcut_toggle_explainer',
            )}
          />
        </Menu>
      </MenuContainer>
    </Box>
  );
}
