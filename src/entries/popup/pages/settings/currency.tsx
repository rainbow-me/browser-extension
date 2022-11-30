import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { Box } from '~/design-system';
import { menuTransition } from '~/entries/popup/utils/animation';

import { Menu } from '../../components/Menu/Menu';
import { MenuContainer } from '../../components/Menu/MenuContainer';
import { MenuItem } from '../../components/Menu/MenuItem';

interface CurrencyOption {
  label: string;
  emoji: string;
}

const currencies: { [key: string]: CurrencyOption } = {
  eth: {
    label: 'Ethereum',
    emoji: '🔷',
  },
  usd: {
    label: 'United States Dollar',
    emoji: '🇺🇸',
  },
  eur: {
    label: 'Euro',
    emoji: '🇪🇺',
  },
  gbp: {
    label: 'British Pound',
    emoji: '🇬🇧',
  },
  jpy: {
    label: 'Japanese Yen',
    emoji: '🇯🇵',
  },
};
export function Currency() {
  const [selectedCurrency, setSelectedCurrency] = useState('eur');
  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={menuTransition}
    >
      <PageHeader
        title="Currency"
        leftRoute="/settings"
        leftSymbol="arrowLeft"
      />
      <Box paddingHorizontal="20px">
        <MenuContainer testID="settings-menu-container">
          <Menu>
            {Object.keys(currencies).map((currency) => (
              <MenuItem
                leftComponent={
                  <MenuItem.TextIcon icon={currencies[currency].emoji} />
                }
                rightComponent={
                  selectedCurrency === currency ? (
                    <MenuItem.SelectionIcon />
                  ) : null
                }
                key={currencies[currency].label}
                titleComponent={
                  <MenuItem.Title text={currencies[currency].label} />
                }
                onClick={() => setSelectedCurrency(currency)}
              />
            ))}
          </Menu>
        </MenuContainer>
      </Box>
    </Box>
  );
}
