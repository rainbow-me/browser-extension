import { motion } from 'framer-motion';
import React from 'react';

import { i18n } from '~/core/languages';
import { Box } from '~/design-system';
import { menuTransition } from '~/entries/popup/utils/animation';

import { Menu } from '../../components/Menu/Menu';
import { MenuContainer } from '../../components/Menu/MenuContainer';
import { MenuItem } from '../../components/Menu/MenuItem';

export function Transactions() {
  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={menuTransition}
    >
      <PageHeader
        title="Transactions"
        leftRoute="/settings"
        leftSymbol="arrowLeft"
      />
      <Box paddingHorizontal="20px">
        <MenuContainer testID="settings-menu-container">
          <Menu>
            <MenuItem
              hasSfSymbol
              hasChevron
              titleComponent={
                <MenuItem.Title text={i18n.t('transactions.default_speed')} />
              }
              rightComponent={<MenuItem.Selection text="🚨 Urgent" />}
            />
          </Menu>
          <Menu>
            <MenuItem
              hasSfSymbol
              titleComponent={
                <MenuItem.Title text={i18n.t('transactions.use_flashbots')} />
              }
            />
            <MenuItem.Description
              text={i18n.t('transactions.flashbots_description')}
            />
          </Menu>
        </MenuContainer>
      </Box>
    </Box>
  );
}
