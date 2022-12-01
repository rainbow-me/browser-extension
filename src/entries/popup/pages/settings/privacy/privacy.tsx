import React from 'react';
import { useNavigate } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { autoLockTimerOptions } from '~/core/references/autoLockTimer';
import { useAutoLockTimerStore } from '~/core/state/currentSettings/autoLockTimer';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { useHideSmallBalancesStore } from '~/core/state/currentSettings/hideSmallBalances';
import { Box } from '~/design-system';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { SFSymbol } from '~/entries/popup/components/SFSymbol/SFSymbol';

export function Privacy() {
  const navigate = useNavigate();
  const { hideAssetBalances, setHideAssetBalances } =
    useHideAssetBalancesStore();
  const { hideSmallBalances, setHideSmallBalances } =
    useHideSmallBalancesStore();
  const { autoLockTimer } = useAutoLockTimerStore();
  return (
    <Box paddingHorizontal="20px">
      <MenuContainer testId="settings-menu-container">
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
                handleChange={setHideAssetBalances}
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
                handleChange={setHideSmallBalances}
              />
            }
            titleComponent={
              <MenuItem.Title
                text={i18n.t('privacy_and_security.auto_hide_balances_under_1')}
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
            rightComponent={
              <MenuItem.Selection
                text={autoLockTimerOptions[autoLockTimer].label}
              />
            }
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
  );
}
