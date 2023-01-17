import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { KeychainType, KeychainWallet } from '~/core/types/keychainTypes';
import { Box, Symbol } from '~/design-system';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { create, getWallets } from '~/entries/popup/handlers/wallet';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

export function WalletsAndKeys() {
  const { state } = useLocation();
  const navigate = useRainbowNavigate();
  const [wallets, setWallets] = useState<KeychainWallet[]>([]);

  const handleViewWallet = (wallet: KeychainWallet) => {
    navigate(ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS, {
      state: { wallet, password: state.password },
    });
  };

  useEffect(() => {
    const fetchWallets = async () => {
      const walletsFromKeychain = await getWallets();
      const controlledWallets = walletsFromKeychain.filter(
        (wallet) => wallet.type !== KeychainType.ReadOnlyKeychain,
      );

      setWallets(controlledWallets);
    };
    fetchWallets();
  }, []);

  const handleCreateNewRecoveryPhrase = async () => {
    const newWalletAccount = await create();
    navigate(
      ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_WARNING,
      {
        state: {
          wallet: {
            accounts: [newWalletAccount],
            imported: false,
            type: KeychainType.HdKeychain,
          },
          password: state.password,
        },
      },
    );
  };

  return (
    <Box>
      <Box paddingHorizontal="20px">
        <MenuContainer>
          {wallets.map((wallet, idx) => {
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
              <Menu key={idx}>
                <MenuItem
                  titleComponent={
                    <MenuItem.Title
                      text={`${i18n.t(
                        'settings.privacy_and_security.wallets_and_keys.recovery_phrase_label',
                      )} ${idx + 1}`}
                    />
                  }
                  labelComponent={<MenuItem.Label text={label} />}
                  onClick={() => handleViewWallet(wallet)}
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
              onClick={handleCreateNewRecoveryPhrase}
            />
          </Menu>
        </MenuContainer>
      </Box>
    </Box>
  );
}
