import React from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useUserChainsStore } from '~/core/state/userChains';
import { ChainId } from '~/core/types/chains';
import { getSupportedChains } from '~/core/utils/chains';
import { reorder } from '~/core/utils/draggable';
import { Box, Inset, Symbol, Text } from '~/design-system';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

import { ChainBadge } from '../../components/ChainBadge/ChainBadge';
import { DraggableContext, DraggableItem } from '../../components/Draggable';
import { QuickPromo } from '../../components/QuickPromo/QuickPromo';

export const sortNetworks = (order: ChainId[], chains: Chain[]) =>
  chains.sort((a, b) => {
    const aIndex = order.indexOf(a.id);
    const bIndex = order.indexOf(b.id);
    if (aIndex === -1) return bIndex === -1 ? 0 : 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

export function SettingsNetworks() {
  const {
    userChains,
    updateUserChain,
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
                  <DraggableItem
                    key={`${chain.id}`}
                    id={`${chain.id}`}
                    index={index}
                  >
                    <MenuItem
                      first={index === 0}
                      leftComponent={
                        <ChainBadge chainId={chain.id} size="18" shadow />
                      }
                      rightComponent={
                        userChains[chain.id] ? <MenuItem.SelectionIcon /> : null
                      }
                      key={chain.name}
                      titleComponent={<MenuItem.Title text={chain.name} />}
                      onClick={() =>
                        updateUserChain({
                          chainId: chain.id,
                          enabled: !userChains[chain.id],
                        })
                      }
                    />
                  </DraggableItem>
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
                testId="testnet-mode-toggle"
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
