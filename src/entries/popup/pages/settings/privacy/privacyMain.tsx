import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { Box } from '~/design-system';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { PageHeader } from '~/entries/popup/components/PageHeader/PageHeader';
import { SFSymbol } from '~/entries/popup/components/SFSymbol/SFSymbol';
import { menuTransition } from '~/entries/popup/utils/animation';

export function PrivacyMain() {
  const navigate = useNavigate();
  const [hideAssetBalances, setHideAssetBalances] = useState(false);
  const handleChangeHideAssetBalances = (checked: boolean) => {
    setHideAssetBalances(checked);
  };
  const [hideSmallBalances, setHideSmallBalances] = useState(true);
  const handleChangeHideSmallBalances = (checked: boolean) => {
    setHideSmallBalances(checked);
  };
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
              leftComponent={
                <SFSymbol
                  symbol="eyeSlashCircleFill"
                  size={18}
                  color="labelQuaternary"
                />
              }
              rightComponent={
                <Toggle
                  checked={hideAssetBalances}
                  handleChange={handleChangeHideAssetBalances}
                />
              }
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
              rightComponent={
                <Toggle
                  checked={hideSmallBalances}
                  handleChange={handleChangeHideSmallBalances}
                />
              }
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
              rightComponent={<MenuItem.Selection text="10 minutes" />}
              titleComponent={
                <MenuItem.Title
                  text={i18n.t('privacy_and_security.auto_lock_timer')}
                />
              }
              onClick={() => navigate('/settings/privacy/autoLockTimer')}
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
