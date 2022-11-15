import { motion } from 'framer-motion';
import React from 'react';

import { Box } from '~/design-system';
import { menuTransition } from '~/entries/popup/utils/animation';

import { Menu } from '../../components/Menu/Menu';
import { MenuContainer } from '../../components/Menu/MenuContainer';
import { MenuItem } from '../../components/Menu/MenuItem';

const currencies = [
  {
    name: 'Ethereum',
    emoji: '🔷',
  },
  {
    name: 'United States Dollar',
    emoji: '🇺🇸',
  },
  {
    name: 'Euro',
    emoji: '🇪🇺',
  },
  {
    name: 'British Pound',
    emoji: '🇬🇧',
  },
  {
    name: 'Japanese Yen',
    emoji: '🇯🇵',
  },
];
export function Currency() {
  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={menuTransition}
    >
      <MenuContainer testID="settings-menu-container">
        <Menu>
          {currencies.map((currency) => (
            <MenuItem
              leftComponent={<MenuItem.TextIcon icon={currency.emoji} />}
              key={currency.name}
              hasSfSymbol
              titleComponent={<MenuItem.Title text={currency.name} />}
            />
          ))}
        </Menu>
      </MenuContainer>
    </Box>
  );
}
