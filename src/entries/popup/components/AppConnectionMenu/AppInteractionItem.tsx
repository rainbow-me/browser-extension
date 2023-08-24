import { motion } from 'framer-motion';
import React, { useMemo } from 'react';

import { i18n } from '~/core/languages';
import { AppSession } from '~/core/state/appSessions';
import { Box, Column, Columns, Inline, Symbol, Text } from '~/design-system';

import { ChevronDown } from '../ChevronDown/ChevronDown';
import { ContextMenuRadioItem } from '../ContextMenu/ContextMenu';
import { DropdownMenuRadioItem } from '../DropdownMenu/DropdownMenu';

export const AppInteractionItem = ({
  appSession,
  chevronDirection,
  showChevron,
  type = 'dropdown',
}: {
  appSession: AppSession;
  chevronDirection: 'right' | 'down';
  showChevron: boolean;
  type?: 'dropdown' | 'context';
}) => {
  const { MenuRadioItem } = useMemo(() => {
    return {
      MenuRadioItem:
        type === 'dropdown' ? DropdownMenuRadioItem : ContextMenuRadioItem,
    };
  }, [type]);

  return (
    <MenuRadioItem
      onSelect={(e) => {
        e.preventDefault();
      }}
      highlightAccentColor
      value="switch-networks"
    >
      <Box width="full" testId="switch-networks-app-interation-item">
        <Columns alignVertical="center" space="8px">
          <Column width="content">
            <Box height="fit" style={{ height: '18px', width: '18px' }}>
              <Inline
                height="full"
                alignHorizontal="center"
                alignVertical="center"
              >
                <Symbol
                  size={14}
                  symbol={
                    !appSession ? 'app.connected.to.app.below.fill' : 'network'
                  }
                  weight="semibold"
                />
              </Inline>
            </Box>
          </Column>
          <Column>
            <Text size="14pt" weight="semibold">
              {i18n.t(
                `menu.app_connection_menu.${
                  !appSession ? 'connect' : 'switch_networks'
                }`,
              )}
            </Text>
          </Column>
          {showChevron && (
            <Column width="content">
              <Box style={{ rotate: '-90deg' }}>
                <Box
                  as={motion.div}
                  animate={{ rotate: chevronDirection === 'right' ? 0 : 90 }}
                  initial={{ rotate: chevronDirection === 'right' ? 90 : 0 }}
                  exit={{ rotate: chevronDirection === 'right' ? 90 : 0 }}
                >
                  <ChevronDown color="labelTertiary" />
                </Box>
              </Box>
            </Column>
          )}
        </Columns>
      </Box>
    </MenuRadioItem>
  );
};
