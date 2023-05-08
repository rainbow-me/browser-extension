/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { KeychainType, KeychainWallet } from '~/core/types/keychainTypes';
import { setSettingWallets } from '~/core/utils/settings';
import { Box, Symbol } from '~/design-system';
import { foregroundColorVars } from '~/design-system/styles/core.css';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { create, getWallets } from '~/entries/popup/handlers/wallet';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

const TrezorIcon = () => (
  <Box>
    <svg
      width="11"
      height="16"
      viewBox="0 0 11 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.19788 3.86515C9.19788 1.90834 7.47796 0.284912 5.38416 0.284912C3.28999 0.284912 1.56969 1.90909 1.56969 3.86477V4.36663C1.56969 4.72167 1.28187 5.00949 0.92683 5.00949H0.642857C0.287817 5.00949 0 5.29731 0 5.65235V12.828C0 13.0792 0.146251 13.3073 0.374458 13.4122L4.84646 15.4669C5.18707 15.6234 5.57902 15.6235 5.91968 15.4671L10.3944 13.4129C10.6227 13.3081 10.7691 13.0799 10.7691 12.8286V5.68867C10.7691 5.33363 10.4813 5.04582 10.1262 5.04582H9.84143C9.48671 5.04582 9.19903 4.7585 9.19858 4.40378L9.19788 3.86515ZM3.51401 3.86515C3.51401 2.94256 4.33708 2.20426 5.38416 2.20426C6.43125 2.20426 7.25356 2.94256 7.25356 3.86515V4.68806C7.25356 4.86558 7.10965 5.00949 6.93213 5.00949H3.83571C3.65823 5.00949 3.51434 4.86564 3.51428 4.68817L3.51401 3.86515ZM8.59997 11.7058C8.59997 11.8314 8.52682 11.9455 8.41267 11.9979L5.65086 13.2661C5.4806 13.3443 5.2847 13.3443 5.11443 13.2661L2.3538 11.999C2.23963 11.9466 2.16646 11.8325 2.16646 11.7069V7.28735C2.16646 7.10983 2.31036 6.96592 2.48788 6.96592H8.2782C8.45571 6.96592 8.59961 7.10981 8.59963 7.28733L8.59997 11.7058Z"
        fill={foregroundColorVars.label}
      />
    </svg>
  </Box>
);
const LedgerIcon = () => (
  <Box>
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.98008 12H10.3496C10.7916 12 11.0747 11.7634 11.0747 11.3446C11.0747 10.9258 10.7839 10.6892 10.3496 10.6892H8.80222V7.16798C8.80222 6.6173 8.50361 6.30706 7.98008 6.30706C7.45655 6.30706 7.15794 6.6173 7.15794 7.16798V11.1391C7.15794 11.6898 7.45655 12 7.98008 12Z"
        fill={foregroundColorVars.label}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.2369 15.3955C16.3245 15.3955 16.3955 15.3245 16.3955 15.2369V12.9887C16.3955 12.5456 16.7547 12.1864 17.1977 12.1864C17.6408 12.1864 18 12.5456 18 12.9887V15.2369C18 16.2106 17.2106 17 16.2369 17H13.3469C12.9038 17 12.5446 16.6408 12.5446 16.1977C12.5446 15.7547 12.9038 15.3955 13.3469 15.3955H16.2369Z"
        fill={foregroundColorVars.label}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.76311 2.60454C1.67553 2.60454 1.60454 2.67553 1.60454 2.76311V5.01135C1.60454 5.45443 1.24535 5.81362 0.802268 5.81362C0.359187 5.81362 0 5.45443 0 5.01135V2.76311C0 1.78937 0.789373 1 1.76311 1H4.65314C5.09622 1 5.4554 1.35919 5.4554 1.80227C5.4554 2.24535 5.09622 2.60454 4.65314 2.60454H1.76311Z"
        fill={foregroundColorVars.label}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.76311 15.3955C1.67553 15.3955 1.60454 15.3245 1.60454 15.2369V12.9887C1.60454 12.5456 1.24535 12.1864 0.802268 12.1864C0.359187 12.1864 0 12.5456 0 12.9887V15.2369C0 16.2106 0.789373 17 1.76311 17H4.65314C5.09622 17 5.4554 16.6408 5.4554 16.1977C5.4554 15.7547 5.09622 15.3955 4.65314 15.3955H1.76311Z"
        fill={foregroundColorVars.label}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.2369 2.60454C16.3245 2.60454 16.3955 2.67553 16.3955 2.76311V5.01135C16.3955 5.45443 16.7547 5.81362 17.1977 5.81362C17.6408 5.81362 18 5.45443 18 5.01135V2.76311C18 1.78937 17.2106 1 16.2369 1H13.3469C12.9038 1 12.5446 1.35919 12.5446 1.80227C12.5446 2.24535 12.9038 2.60454 13.3469 2.60454H16.2369Z"
        fill={foregroundColorVars.label}
      />
    </svg>
  </Box>
);

export function WalletsAndKeys() {
  const { state } = useLocation();
  const navigate = useRainbowNavigate();
  const [wallets, setWallets] = useState<KeychainWallet[]>([]);

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

  const handleCreateNewRecoveryPhrase = useCallback(async () => {
    const newWalletAccount = await create();
    const wallet = {
      accounts: [newWalletAccount],
      imported: false,
      type: KeychainType.HdKeychain,
    };
    setSettingWallets(wallet);
    navigate(
      ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_WARNING,
      {
        state: {
          wallet,
          password: state?.password,
          showQuiz: true,
        },
      },
    );
  }, [navigate, state?.password]);

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
            const singleAccount = wallet.accounts.length === 1;
            const label = `${
              wallet.imported || wallet.type === KeychainType.KeyPairKeychain
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
                  labelComponent={<MenuItem.Label text={label} />}
                  onClick={() => handleViewWallet(wallet)}
                  leftComponent={
                    wallet.type === KeychainType.HardwareWalletKeychain ? (
                      wallet.vendor === 'trezor' ? (
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
                        size={18}
                        color="labelTertiary"
                      />
                    )
                  }
                  hasRightArrow
                />
                <MenuItem.AccountList accounts={wallet.accounts} />
              </Menu>
            );
          })}
          <Menu>
            <MenuItem
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
