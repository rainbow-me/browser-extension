import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { Box, Text } from '~/design-system';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { SFSymbol } from '~/entries/popup/components/SFSymbol/SFSymbol';
import { menuTransition } from '~/entries/popup/utils/animation';

export function Main() {
  const navigate = useNavigate();
  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={menuTransition}
    >
      <PageHeader title="Settings" leftRoute="/" leftSymbol="arrowLeft" />
      <Box paddingHorizontal="20px">
        <MenuContainer testID="settings-menu-container">
          <Menu>
            <MenuItem
              hasSfSymbol
              leftComponent={
                <SFSymbol symbol="lockFill" color="blue" size={18} />
              }
              hasRightArrow
              onPress={() => navigate('/settings/privacy')}
              titleComponent={
                <MenuItem.Title
                  text={i18n.t('settings.privacy_and_security')}
                />
              }
            />
          </Menu>
          <Menu>
            <MenuItem
              hasRightArrow
              leftComponent={<SFSymbol symbol="boltFill" color="red" />}
              onPress={() => navigate('/settings/transactions')}
              titleComponent={
                <MenuItem.Title text={i18n.t('settings.transactions')} />
              }
            />
            <MenuItem
              hasRightArrow
              leftComponent={<SFSymbol symbol="send" color="green" />}
              onPress={() => navigate('/settings/currency')}
              rightComponent={<MenuItem.Selection text="Euro" />}
              titleComponent={
                <MenuItem.Title text={i18n.t('settings.currency')} />
              }
            />
            <MenuItem
              hasChevron
              leftComponent={
                <SFSymbol symbol="moonStars" color="purple" size={18} />
              }
              rightComponent={<MenuItem.Selection text="System" />}
              titleComponent={
                <MenuItem.Title text={i18n.t('settings.theme')} />
              }
            />
            <MenuItem
              leftComponent={
                <SFSymbol
                  symbol="personTextRectangleFill"
                  color="blue"
                  size={18}
                />
              }
              titleComponent={
                <MenuItem.Title text={i18n.t('settings.contacts')} />
              }
            />
          </Menu>
          <Menu>
            <MenuItem
              leftComponent={<MenuItem.TextIcon icon="🌈" />}
              titleComponent={
                <MenuItem.Title text={i18n.t('settings.share_rainbow')} />
              }
              rightComponent={
                <SFSymbol
                  symbol="arrowUpRightCircle"
                  color="labelTertiary"
                  size={14}
                />
              }
            />
            <MenuItem
              leftComponent={<MenuItem.TextIcon icon="🧠" />}
              titleComponent={
                <MenuItem.Title
                  text={i18n.t('settings.learn_about_ethereum')}
                />
              }
              rightComponent={
                <SFSymbol
                  symbol="arrowUpRightCircle"
                  color="labelTertiary"
                  size={14}
                />
              }
            />
            <MenuItem
              leftComponent={<MenuItem.TextIcon icon="🐦" />}
              titleComponent={
                <MenuItem.Title
                  text={i18n.t('settings.follow_us_on_twitter')}
                />
              }
              rightComponent={
                <SFSymbol
                  symbol="arrowUpRightCircle"
                  color="labelTertiary"
                  size={14}
                />
              }
            />
            <MenuItem
              leftComponent={<MenuItem.TextIcon icon="💬" />}
              titleComponent={
                <MenuItem.Title
                  text={i18n.t('settings.feedback_and_support')}
                />
              }
              rightComponent={
                <SFSymbol
                  symbol="arrowUpRightCircle"
                  color="labelTertiary"
                  size={14}
                />
              }
            />
          </Menu>
        </MenuContainer>
      </Box>
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
