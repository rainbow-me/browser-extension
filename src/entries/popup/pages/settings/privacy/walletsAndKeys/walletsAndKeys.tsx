/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { KeychainType, KeychainWallet } from '~/core/types/keychainTypes';
import { setSettingWallets } from '~/core/utils/settings';
import { Box, Button, Inline, Symbol, Text } from '~/design-system';
import { LedgerIcon } from '~/entries/popup/components/LedgerIcon/LedgerIcon';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { TrezorIcon } from '~/entries/popup/components/TrezorIcon/TrezorIcon';
import { getWallets } from '~/entries/popup/handlers/wallet';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useWalletBackUps } from '~/entries/popup/hooks/useWalletBackUps';
import { ROUTES } from '~/entries/popup/urls';

export function WalletsAndKeys() {
  const navigate = useRainbowNavigate();
  const [wallets, setWallets] = useState<KeychainWallet[]>([]);
  const { isWalletBackedUp } = useWalletBackUps();

  useEffect(() => {
    setSettingWallets(null);
  }, []);

  const handleViewWallet = useCallback(
    async (wallet: KeychainWallet) => {
      setSettingWallets(wallet);
      navigate(ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS, {
        state: { wallet },
      });
    },
    [navigate],
  );

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

  const handleCreateNewWallet = useCallback(async () => {
    navigate(ROUTES.CHOOSE_WALLET_GROUP);
  }, [navigate]);

  const walletCountPerType = {
    hd: 0,
    pk: 0,
    hw: 0,
  };

  return (
    <Box>
      <Box paddingHorizontal="20px">
        <MenuContainer>
          {wallets.map((wallet, idx) => {
            const walletBackedUp = isWalletBackedUp({ wallet });
            const singleAccount = wallet.accounts.length === 1;
            const importedLabel = `${
              !walletBackedUp
                ? 'Not backed up  ‧'
                : wallet.imported ||
                  wallet.type === KeychainType.KeyPairKeychain
                ? `${i18n.t(
                    'settings.privacy_and_security.wallets_and_keys.imported',
                  )} ‧`
                : ''
            }`;
            const walletsLabel = `${wallet.accounts.length} ${i18n.t(
              `settings.privacy_and_security.wallets_and_keys.${
                singleAccount ? 'wallet_single' : 'wallet_plural'
              }`,
            )}`;

            if (wallet.type === KeychainType.HdKeychain) {
              walletCountPerType.hd += 1;
            } else if (wallet.type === KeychainType.KeyPairKeychain) {
              walletCountPerType.pk += 1;
            } else if (wallet.type === KeychainType.HardwareWalletKeychain) {
              walletCountPerType.hw += 1;
            }

            return (
              <Menu key={idx}>
                <MenuItem
                  testId={`wallet-group-${idx + 1}`}
                  first
                  titleComponent={
                    <MenuItem.Title
                      text={`${i18n.t(
                        wallet.type === KeychainType.HdKeychain
                          ? 'settings.privacy_and_security.wallets_and_keys.recovery_phrase_label'
                          : wallet.type === KeychainType.HardwareWalletKeychain
                          ? 'settings.privacy_and_security.wallets_and_keys.hardware_wallet_label'
                          : 'settings.privacy_and_security.wallets_and_keys.private_key_label',
                      )} ${
                        wallet.type === KeychainType.HdKeychain
                          ? walletCountPerType.hd
                          : wallet.type === KeychainType.HardwareWalletKeychain
                          ? walletCountPerType.hw
                          : walletCountPerType.pk
                      }`}
                    />
                  }
                  labelComponent={
                    <Inline alignVertical="center" space="4px">
                      {importedLabel ? (
                        <Text
                          color={walletBackedUp ? 'labelTertiary' : 'red'}
                          size="12pt"
                          weight={walletBackedUp ? 'medium' : 'bold'}
                        >
                          {importedLabel}
                        </Text>
                      ) : null}
                      <Text color="labelTertiary" size="12pt" weight="medium">
                        {walletsLabel}
                      </Text>
                    </Inline>
                  }
                  onClick={() => handleViewWallet(wallet)}
                  leftComponent={
                    wallet.type === KeychainType.HardwareWalletKeychain ? (
                      wallet.vendor === 'Trezor' ? (
                        <TrezorIcon />
                      ) : (
                        <LedgerIcon />
                      )
                    ) : (
                      <Symbol
                        symbol={
                          singleAccount
                            ? 'lock.square.fill'
                            : 'lock.square.stack.fill'
                        }
                        weight="medium"
                        size={22}
                        color="labelTertiary"
                      />
                    )
                  }
                  hasRightArrow
                />
                <MenuItem.AccountList accounts={wallet.accounts} />
                {walletBackedUp ? null : (
                  <Box paddingHorizontal="16px" paddingVertical="16px">
                    <Inline alignHorizontal="center" alignVertical="center">
                      <Button
                        width="full"
                        color="red"
                        height="36px"
                        variant="tinted"
                      >
                        Back Up Now
                      </Button>
                    </Inline>
                  </Box>
                )}
              </Menu>
            );
          })}
          <Menu>
            <MenuItem
              testId={'create-a-new-wallet'}
              first
              last
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
                    'settings.privacy_and_security.wallets_and_keys.create_a_new_wallet',
                  )}
                  color="blue"
                />
              }
              onClick={handleCreateNewWallet}
            />
          </Menu>
        </MenuContainer>
      </Box>
    </Box>
  );
}
