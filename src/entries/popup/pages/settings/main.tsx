// import { motion } from 'framer-motion';
import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Text } from '~/design-system';

import { Menu } from '../../components/Menu/Menu';
import { MenuContainer } from '../../components/Menu/MenuContainer';
import { MenuItem } from '../../components/Menu/MenuItem';
import { SFSymbol } from '../../components/SFSymbol/SFSymbol';
import { menuTransition } from '../../utils/animation';

export function Main() {
  const navigate = useNavigate();
  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={menuTransition}
    >
      <MenuContainer testID="settings-menu-container">
        <Menu>
          <MenuItem
            hasSfSymbol
            leftComponent={<SFSymbol symbol="send" />}
            hasRightArrow
            testID="test"
            onPress={() => navigate('/settings/privacy')}
            titleComponent={<MenuItem.Title text="Privacy & Security" />}
          />
        </Menu>
        <Menu>
          <MenuItem
            hasRightArrow
            testID="test"
            leftComponent={<SFSymbol symbol="send" />}
            onPress={() => navigate('/settings/transactions')}
            titleComponent={<MenuItem.Title text="Transactions" />}
          />
          <MenuItem
            hasRightArrow
            testID="test"
            leftComponent={<SFSymbol symbol="send" />}
            onPress={() => navigate('/settings/currency')}
            titleComponent={<MenuItem.Title text="Currency" />}
          />
          <MenuItem
            hasChevron
            testID="test"
            leftComponent={<SFSymbol symbol="send" />}
            titleComponent={<MenuItem.Title text="Theme" />}
          />
          <MenuItem
            testID="test"
            leftComponent={<SFSymbol symbol="send" />}
            titleComponent={<MenuItem.Title text="Contacts" />}
          />
        </Menu>
        <Menu>
          <MenuItem
            testID="test"
            leftComponent={<SFSymbol symbol="send" />}
            titleComponent={<MenuItem.Title text="Share Rainbow" />}
          />
          <MenuItem
            testID="test"
            leftComponent={<SFSymbol symbol="send" />}
            titleComponent={<MenuItem.Title text="Learn about Ethereum" />}
          />
          <MenuItem
            testID="test"
            leftComponent={<SFSymbol symbol="send" />}
            titleComponent={<MenuItem.Title text="Follow us on Twitter" />}
          />
          <MenuItem
            testID="test"
            leftComponent={<SFSymbol symbol="send" />}
            titleComponent={<MenuItem.Title text="Feedback & Support" />}
          />
        </Menu>
      </MenuContainer>
      <Box
        padding="20px"
        alignItems="center"
        justifyContent="center"
        style={{ textAlign: 'center' }}
      >
        <Text size="12pt" weight="semibold" color="labelTertiary">
          1.2.34 (56)
        </Text>
      </Box>
    </Box>
  );
}
