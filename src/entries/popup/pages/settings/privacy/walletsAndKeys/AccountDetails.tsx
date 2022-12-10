import React from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { DummyWallet } from '~/core/types/walletsAndKeys';
import { truncateAddress } from '~/core/utils/address';
import { Box, Symbol } from '~/design-system';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

export function AccountDetails() {
  const { state } = useLocation();

  return (
    <Box>
      <Box paddingHorizontal="20px">
        <MenuContainer testId="settings-menu-container">
          <Menu>
            <MenuItem
              titleComponent={
                <MenuItem.Title
                  text={i18n.t(
                    'settings.privacy_and_security.wallets_and_keys.account_details.view_recovery_phrase',
                  )}
                />
              }
              leftComponent={
                <Symbol
                  symbol="lock.square.fill"
                  weight="medium"
                  size={18}
                  color="labelTertiary"
                />
              }
              hasRightArrow
            />
          </Menu>
          <Menu>
            {state?.account.wallets.map((wallet: DummyWallet) => {
              return (
                <MenuItem
                  key={wallet.address}
                  titleComponent={
                    <MenuItem.Title
                      text={wallet.ens || truncateAddress(wallet.address)}
                    />
                  }
                  labelComponent={
                    wallet.ens ? (
                      <MenuItem.Label text={truncateAddress(wallet.address)} />
                    ) : null
                  }
                  hasRightArrow
                />
              );
            })}
          </Menu>
          <Menu>
            <MenuItem
              leftComponent={
                <Symbol
                  size={18}
                  color="blue"
                  weight="medium"
                  symbol="plus.circle.fill"
                />
              }
              titleComponent={
                <MenuItem.Title
                  text={i18n.t(
                    'settings.privacy_and_security.wallets_and_keys.account_details.create_new_wallet',
                  )}
                  color="blue"
                />
              }
            />
          </Menu>
        </MenuContainer>
      </Box>
    </Box>
  );
}
