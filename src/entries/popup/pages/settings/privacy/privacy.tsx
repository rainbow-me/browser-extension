import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { autoLockTimerOptions } from '~/core/references/autoLockTimer';
import { useAutoLockTimerStore } from '~/core/state/currentSettings/autoLockTimer';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { useHideSmallBalancesStore } from '~/core/state/currentSettings/hideSmallBalances';
import { Box, Symbol } from '~/design-system';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { ROUTES } from '~/entries/popup/urls';

import { ConfirmPasswordPrompt } from './confirmPasswordPrompt';

export function Privacy() {
  const navigate = useNavigate();
  const { hideAssetBalances, setHideAssetBalances } =
    useHideAssetBalancesStore();
  const { hideSmallBalances, setHideSmallBalances } =
    useHideSmallBalancesStore();
  const { autoLockTimer } = useAutoLockTimerStore();
  const [showEnterPassword, setShowEnterPassword] = useState(false);
  const [confirmPasswordRedirect, setConfirmPasswordRedirect] = useState('');
  const openPasswordPrompt = () => {
    setShowEnterPassword(true);
  };
  const closePasswordPrompt = () => {
    setShowEnterPassword(false);
  };
  const handleChangePassword = async () => {
    setConfirmPasswordRedirect('/settings/privacy/changePassword');
    openPasswordPrompt();
  };
  const handleWalletsAndKeys = async () => {
    setConfirmPasswordRedirect('/settings/privacy/walletsAndKeys');
    openPasswordPrompt();
  };
  return (
    <Box>
      <ConfirmPasswordPrompt
        show={showEnterPassword}
        onClose={closePasswordPrompt}
        redirect={confirmPasswordRedirect}
      />
      <Box paddingHorizontal="20px">
        <MenuContainer testId="settings-menu-container">
          <Menu>
            <MenuItem
              leftComponent={
                <Symbol
                  symbol="eye.slash.circle.fill"
                  size={18}
                  color="labelQuaternary"
                  weight="regular"
                />
              }
              rightComponent={
                <Toggle
                  checked={hideAssetBalances}
                  handleChange={setHideAssetBalances}
                />
              }
              titleComponent={
                <MenuItem.Title
                  text={i18n.t(
                    'settings.privacy_and_security.hide_asset_balances',
                  )}
                />
              }
            />
            <MenuItem.Description
              text={i18n.t(
                'settings.privacy_and_security.hide_asset_balances_description',
              )}
            />
            <MenuItem
              rightComponent={
                <Toggle
                  checked={hideSmallBalances}
                  handleChange={setHideSmallBalances}
                />
              }
              titleComponent={
                <MenuItem.Title
                  text={i18n.t(
                    'settings.privacy_and_security.auto_hide_balances_under_1',
                  )}
                />
              }
            />
          </Menu>
          <Menu>
            <MenuItem
              hasRightArrow
              titleComponent={
                <MenuItem.Title
                  text={i18n.t(
                    'settings.privacy_and_security.change_password.title',
                  )}
                />
              }
              onClick={handleChangePassword}
            />
            <MenuItem
              hasRightArrow
              rightComponent={
                <MenuItem.Selection
                  text={autoLockTimerOptions[autoLockTimer].label}
                />
              }
              titleComponent={
                <MenuItem.Title
                  text={i18n.t(
                    'settings.privacy_and_security.auto_lock_timer.title',
                  )}
                />
              }
              onClick={() => navigate(ROUTES.SETTINGS__PRIVACY__AUTOLOCK)}
            />
          </Menu>
          <Menu>
            <MenuItem
              hasRightArrow
              titleComponent={
                <MenuItem.Title
                  color="orange"
                  text={i18n.t(
                    'settings.privacy_and_security.wallets_and_keys.title',
                  )}
                />
              }
              onClick={handleWalletsAndKeys}
            />
          </Menu>
        </MenuContainer>
      </Box>
    </Box>
  );
}
