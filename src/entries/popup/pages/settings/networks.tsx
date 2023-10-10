import React from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { useUserChainsStore } from '~/core/state/userChains';
import { ChainId } from '~/core/types/chains';
import { getSupportedChains } from '~/core/utils/chains';
import { reorder } from '~/core/utils/draggable';
import { Box, Inset } from '~/design-system';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

import { ChainBadge } from '../../components/ChainBadge/ChainBadge';
import { DraggableContext, DraggableItem } from '../../components/Draggable';
import { QuickPromo } from '../../components/QuickPromo/QuickPromo';

const sortNetworks = (order: ChainId[], chains: Chain[]) =>
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
          <DraggableContext onDragEnd={onDragEnd}>
            <Box paddingHorizontal="8px" paddingVertical="4px">
              {sortNetworks(userChainsOrder, supportedChains).map(
                (chain, index) => (
                  <DraggableItem
                    key={`${chain.id}`}
                    id={`${chain.id}`}
                    index={index}
                  >
                    <MenuItem
                      first={index === 0}
                      last={index === supportedChains.length - 1}
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
        </Menu>
      </MenuContainer>
    </Box>
  );
}
