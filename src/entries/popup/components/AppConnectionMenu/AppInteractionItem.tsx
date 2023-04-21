import { motion } from 'framer-motion';
import React from 'react';

import { i18n } from '~/core/languages';
import { AppSession } from '~/core/state/appSessions';
import { Box, Column, Columns, Symbol, Text } from '~/design-system';

import { ChevronDown } from '../ChevronDown/ChevronDown';
import { DropdownMenuRadioItem } from '../DropdownMenu/DropdownMenu';

export const AppInteractionItem = ({
  appSession,
  chevronDirection,
  showChevron,
}: {
  appSession: AppSession;
  chevronDirection: 'right' | 'down';
  showChevron: boolean;
}) => {
  return (
    <DropdownMenuRadioItem
      onSelect={(e) => {
        e.preventDefault();
      }}
      highlightAccentColor
      value="switch-networks"
    >
      <Box width="full">
        <Columns alignVertical="center" space="8px">
          <Column width="content">
            <Symbol
              size={12}
              symbol={
                !appSession ? 'app.connected.to.app.below.fill' : 'network'
              }
              weight="semibold"
            />
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
    </DropdownMenuRadioItem>
  );
};
