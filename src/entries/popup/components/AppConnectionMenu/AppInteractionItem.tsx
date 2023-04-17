import { motion } from 'framer-motion';
import React from 'react';

import { AppSession } from '~/core/state/appSessions';
import { Box, Column, Columns, Inline, Symbol, Text } from '~/design-system';

import { ChevronDown } from '../ChevronDown/ChevronDown';
import { DropdownMenuRadioItem } from '../DropdownMenu/DropdownMenu';

export const AppInteractionItem = ({
  connectedAppsId,
  appSession,
  chevronDirection,
  showChevron,
}: {
  connectedAppsId?: string;
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
      <Box width="full" testId={connectedAppsId}>
        <Columns alignVertical="center" space="8px">
          <Column width="content">
            <Inline alignVertical="center" alignHorizontal="center">
              <Symbol
                size={12}
                symbol={
                  !appSession ? 'app.connected.to.app.below.fill' : 'network'
                }
                weight="semibold"
              />
            </Inline>
          </Column>
          <Column>
            <Text size="14pt" weight="semibold">
              {!appSession ? 'Connect' : 'Switch networks'}
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
