import { motion } from 'framer-motion';
import React from 'react';

import { i18n } from '~/core/languages';
import { Box } from '~/design-system';
import { menuTransition } from '~/entries/popup/utils/animation';

import { Menu } from '../../components/Menu/Menu';
import { MenuContainer } from '../../components/Menu/MenuContainer';
import { MenuItem } from '../../components/Menu/MenuItem';
import { SFSymbol } from '../../components/SFSymbol/SFSymbol';

export function Privacy() {
  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={menuTransition}
    >
      <PageHeader
        title="Privacy & Security"
        leftRoute="/settings"
        leftSymbol="arrowLeft"
      />
      <Box paddingHorizontal="20px">
        <MenuContainer testID="settings-menu-container">
          <Menu>
            <MenuItem
              hasSfSymbol
              leftComponent={<SFSymbol symbol="send" />}
              titleComponent={
                <MenuItem.Title
                  text={i18n.t('privacy_and_security.hide_asset_balances')}
                />
              }
            />
            <MenuItem.Description
              text={i18n.t(
                'privacy_and_security.hide_asset_balances_description',
              )}
            />
            <MenuItem
              hasSfSymbol
              titleComponent={
                <MenuItem.Title
                  text={i18n.t(
                    'privacy_and_security.auto_hide_balances_under_1',
                  )}
                />
              }
            />
          </Menu>
          <Menu>
            <MenuItem
              hasSfSymbol
              hasRightArrow
              titleComponent={
                <MenuItem.Title
                  text={i18n.t('privacy_and_security.change_password')}
                />
              }
            />
            <MenuItem
              hasSfSymbol
              hasRightArrow
              titleComponent={
                <MenuItem.Title
                  text={i18n.t('privacy_and_security.auto_lock_timer')}
                />
              }
            />
          </Menu>
          <Menu>
            <MenuItem
              hasSfSymbol
              hasRightArrow
              titleComponent={
                <MenuItem.Title
                  color="red"
                  text={i18n.t('privacy_and_security.view_private_key')}
                />
              }
            />
            <MenuItem
              hasSfSymbol
              hasRightArrow
              titleComponent={
                <MenuItem.Title
                  color="red"
                  text={i18n.t(
                    'privacy_and_security.view_secret_recovery_phrase',
                  )}
                />
              }
            />
          </Menu>
        </MenuContainer>
      </Box>
    </Box>
  );
}
