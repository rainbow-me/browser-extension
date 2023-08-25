import { motion } from 'framer-motion';
import React, { useMemo } from 'react';

import { i18n } from '~/core/languages';
import { AppSession } from '~/core/state/appSessions';
import { Box, Column, Columns, Inline, Symbol, Text } from '~/design-system';

import { ChevronSwitcher } from '../ChevronSwitcher/ChevronSwitcher';
import { ContextMenuRadioItem } from '../ContextMenu/ContextMenu';
import { DropdownMenuRadioItem } from '../DropdownMenu/DropdownMenu';
import { HomeMenuRow } from '../HomeMenuRow/HomeMenuRow';
import { ShortcutHint } from '../ShortcutHint/ShortcutHint';

export const AppInteractionItem = ({
  appSession,
  chevronDirection,
  showChevron,
  shortcutHint,
  type = 'dropdown',
}: {
  appSession: AppSession;
  chevronDirection: 'right' | 'down';
  showChevron: boolean;
  shortcutHint?: string;
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
        <HomeMenuRow
          testId="app-interaction-switch-networks"
          leftComponent={
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
          }
          centerComponent={
            <Columns alignVertical="center" space="8px">
              <Column width="content">
                <Text size="14pt" weight="semibold">
                  {i18n.t(
                    `menu.app_connection_menu.${
                      !appSession ? 'connect' : 'switch_network'
                    }`,
                  )}
                </Text>
              </Column>
              {showChevron && (
                <Column width="content">
                  <Box
                    as={motion.div}
                    paddingTop="3px"
                    style={{
                      height: '18px',
                      width: '18px',
                    }}
                    animate={{
                      rotate: chevronDirection === 'right' ? 0 : 90,
                    }}
                    initial={{
                      rotate: 0,
                    }}
                    exit={{
                      rotate: chevronDirection === 'right' ? 0 : 90,
                    }}
                  >
                    <Inline alignHorizontal="center" alignVertical="center">
                      <Box height="fit" width="fit">
                        <ChevronSwitcher color="labelTertiary" />
                      </Box>
                    </Inline>
                  </Box>
                </Column>
              )}
            </Columns>
          }
          rightComponent={
            shortcutHint ? <ShortcutHint hint={shortcutHint} /> : null
          }
        />
      </Box>
    </MenuRadioItem>
  );
};
