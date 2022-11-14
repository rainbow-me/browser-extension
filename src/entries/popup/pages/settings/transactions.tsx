import { motion } from 'framer-motion';
import React from 'react';

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
      <MenuContainer testID="settings-menu-container">
        <Menu>
          <MenuItem
            hasSfSymbol
            hasChevron
            titleComponent={<MenuItem.Title text="Default Speed" />}
          />
          <MenuItem
            hasSfSymbol
            titleComponent={<MenuItem.Title text="Use Flashbots" />}
          />
        </Menu>
      </MenuContainer>
    </Box>
  );
}
