import React from 'react';
import { useNavigate } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { DummyWallet } from '~/core/types/walletsAndKeys';
import { Box, Symbol } from '~/design-system';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

import testWallets from './testWallets.json'; // temporary account data for UI -- will revisit to hook up with actual wallets

interface DummyWallets {
  [walletId: string]: DummyWallet;
}
export function WalletsAndKeys() {
  const navigate = useNavigate();

  const testData = testWallets as DummyWallets;

  const handleViewWallet = (walletId: string) => {
    navigate(`/settings/privacy/walletsAndKeys/walletDetails`, {
      state: { wallet: testData[walletId] },
    });
  };

  return (
    <Box>
      <Box paddingHorizontal="20px">
        <MenuContainer>
          {Object.keys(testData).map((walletId) => {
            const wallet = testData[walletId];
            const singleAccount = wallet.accounts.length === 1;
            const label = `${
              wallet.imported
                ? `${i18n.t(
                    'settings.privacy_and_security.wallets_and_keys.imported',
                  )} ‧ `
                : ''
            }${wallet.accounts.length} ${
              singleAccount
                ? i18n.t(
                    'settings.privacy_and_security.wallets_and_keys.wallet_single',
                  )
                : i18n.t(
                    'settings.privacy_and_security.wallets_and_keys.wallet_plural',
                  )
            }`;

            return (
              <Menu key={walletId}>
                <MenuItem
                  titleComponent={<MenuItem.Title text={walletId} />}
                  labelComponent={<MenuItem.Label text={label} />}
                  onClick={() => handleViewWallet(walletId)}
                  leftComponent={
                    <Symbol
                      symbol={
                        singleAccount
                          ? 'lock.square.fill'
                          : 'lock.square.stack.fill'
                      }
                      weight="medium"
                      size={18}
                      color="labelTertiary"
                    />
                  }
                  hasRightArrow
                />
                <MenuItem.AccountList accounts={wallet.accounts} />
              </Menu>
            );
          })}
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
                    'settings.privacy_and_security.wallets_and_keys.new_secret_phrase_and_wallet',
                  )}
                  color="blue"
                />
              }
              onClick={() =>
                navigate(
                  '/settings/privacy/walletsAndKeys/walletDetails/recoveryPhraseWarning',
                )
              }
            />
          </Menu>
        </MenuContainer>
      </Box>
    </Box>
  );
}
