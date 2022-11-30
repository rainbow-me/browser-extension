import { motion } from 'framer-motion';
import React from 'react';

import { supportedCurrencies } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { Box } from '~/design-system';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { PageHeader } from '~/entries/popup/components/PageHeader/PageHeader';
import { menuTransition } from '~/entries/popup/utils/animation';

export function Currency() {
  const { currentCurrency, setCurrentCurrency } = useCurrentCurrencyStore();

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
            {Object.keys(supportedCurrencies).map((currency) => (
              <MenuItem
                leftComponent={
                  <MenuItem.TextIcon
                    icon={supportedCurrencies[currency].emoji}
                  />
                }
                rightComponent={
                  currentCurrency === currency ? (
                    <MenuItem.SelectionIcon />
                  ) : null
                }
                key={currency}
                titleComponent={
                  <MenuItem.Title text={supportedCurrencies[currency].label} />
                }
                onClick={() => setCurrentCurrency(currency)}
              />
            ))}
          </Menu>
        </MenuContainer>
      </Box>
    </Box>
  );
}
