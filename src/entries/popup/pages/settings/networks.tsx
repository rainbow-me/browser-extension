/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  DragDropContext,
  Draggable,
  DraggableStateSnapshot,
  DraggingStyle,
  DropResult,
  Droppable,
  NotDraggingStyle,
} from 'react-beautiful-dnd';
import { Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { useUserChainsStore } from '~/core/state/userChains';
import { ChainId } from '~/core/types/chains';
import { getSupportedChains } from '~/core/utils/chains';
import { Box, Inset } from '~/design-system';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

import { ChainBadge } from '../../components/ChainBadge/ChainBadge';
import { QuickPromo } from '../../components/QuickPromo/QuickPromo';
import { accountItem } from '../walletSwitcher/accountItem.css';

const getItemStyle = (
  style: DraggingStyle | NotDraggingStyle | undefined,
  { dropAnimation }: Pick<DraggableStateSnapshot, 'dropAnimation'>,
) => {
  if (!dropAnimation) return style;
  const { moveTo, curve } = dropAnimation;
  return {
    ...style,
    transform: `translate(${moveTo.x}px, ${moveTo.y}px) scale(1)`,
    transition: `all ${curve} .5s`,
  };
};

function reorder<T>(list: Iterable<T>, startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

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
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {({ droppableProps, innerRef }) => (
                <Box
                  {...droppableProps}
                  ref={innerRef}
                  style={{ overflowY: 'scroll' }}
                  paddingHorizontal="8px"
                  paddingVertical="4px"
                >
                  {sortNetworks(userChainsOrder, supportedChains).map(
                    (chain, index) => (
                      <Draggable
                        key={`${chain.id}`}
                        draggableId={`${chain.id}`}
                        index={index}
                        isDragDisabled={false}
                      >
                        {(
                          { innerRef, draggableProps, dragHandleProps },
                          { dropAnimation, isDragging },
                        ) => (
                          <Box
                            ref={innerRef}
                            {...draggableProps}
                            {...dragHandleProps}
                            style={getItemStyle(draggableProps.style, {
                              dropAnimation,
                            })}
                            tabIndex={-1}
                          >
                            <Box
                              className={
                                accountItem[
                                  isDragging && !dropAnimation
                                    ? 'dragging'
                                    : 'idle'
                                ]
                              }
                            >
                              <MenuItem
                                first={index === 0}
                                last={index === supportedChains.length - 1}
                                leftComponent={
                                  <ChainBadge
                                    chainId={chain.id}
                                    size="18"
                                    shadow
                                  />
                                }
                                rightComponent={
                                  userChains[chain.id] ? (
                                    <MenuItem.SelectionIcon />
                                  ) : null
                                }
                                key={chain.name}
                                titleComponent={
                                  <MenuItem.Title text={chain.name} />
                                }
                                onClick={() =>
                                  updateUserChain({
                                    chainId: chain.id,
                                    enabled: !userChains[chain.id],
                                  })
                                }
                              />
                            </Box>
                          </Box>
                        )}
                      </Draggable>
                    ),
                  )}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        </Menu>
      </MenuContainer>
    </Box>
  );
}
