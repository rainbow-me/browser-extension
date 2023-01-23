import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useHiddenWalletsStore } from '~/core/state/hiddenWallets';
import { KeychainWallet } from '~/core/types/keychainTypes';
import { truncateAddress } from '~/core/utils/address';
import { Box, Inline, Symbol } from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import AccountItem, {
  LabelOption,
} from '~/entries/popup/components/AccountItem/AccountItem';
import { LabelPill } from '~/entries/popup/components/LabelPill/LabelPill';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import {
  MoreInfoButton,
  MoreInfoOption,
} from '~/entries/popup/components/MoreInfoButton/MoreInfoButton';
import { getWallet, remove } from '~/entries/popup/handlers/wallet';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { ROUTES } from '~/entries/popup/urls';

import { RemoveWalletPrompt } from '../../../walletSwitcher/removeWalletPrompt';
import { RenameWalletPrompt } from '../../../walletSwitcher/renameWalletPrompt';

import { NewWalletPrompt } from './newWalletPrompt';

const InfoButtonOptions = ({
  account,
  handleViewPrivateKey,
  setRenameAccount,
  setRemoveAccount,
  unhideWallet,
}: {
  account: Address;
  handleViewPrivateKey: (account: Address) => void;
  setRenameAccount: React.Dispatch<React.SetStateAction<Address | undefined>>;
  setRemoveAccount: React.Dispatch<React.SetStateAction<Address | undefined>>;
  unhideWallet: ((address: Address) => void) | undefined;
}): MoreInfoOption[] => [
  {
    onSelect: () => {
      handleViewPrivateKey(account);
    },
    label: i18n.t(
      'settings.privacy_and_security.wallets_and_keys.wallet_details.view_private_key',
    ),
    symbol: 'key.fill',
  },
  {
    onSelect: () => {
      setRenameAccount(account);
    },
    label: i18n.t(
      'settings.privacy_and_security.wallets_and_keys.wallet_details.rename_wallet',
    ),
    symbol: 'person.crop.circle.fill',
  },
  {
    onSelect: () => {
      navigator.clipboard.writeText(account as string);
    },
    label: i18n.t(
      'settings.privacy_and_security.wallets_and_keys.wallet_details.copy_address',
    ),
    subLabel: truncateAddress(account),
    symbol: 'doc.on.doc.fill',
    separator: true,
  },
  ...(unhideWallet
    ? [
        {
          onSelect: () => {
            unhideWallet(account);
          },
          label: i18n.t(
            'settings.privacy_and_security.wallets_and_keys.wallet_details.unhide_wallet',
          ),
          symbol: 'eye.slash.circle.fill' as SymbolProps['symbol'],
        },
      ]
    : []),
  {
    onSelect: () => {
      setRemoveAccount(account);
    },
    label: i18n.t(
      'settings.privacy_and_security.wallets_and_keys.wallet_details.delete_wallet',
    ),
    symbol: 'trash.fill',
    color: 'red',
  },
];

export function WalletDetails() {
  const navigate = useRainbowNavigate();
  const { state } = useLocation();
  const [showNewWalletPrompt, setShowNewWalletPrompt] = useState(false);
  const [renameAccount, setRenameAccount] = useState<Address | undefined>();
  const [removeAccount, setRemoveAccount] = useState<Address | undefined>();

  const [wallet, setWallet] = useState<KeychainWallet>(state?.wallet);
  const handleOpenNewWalletPrompt = () => {
    setShowNewWalletPrompt(true);
  };
  const handleCloseNewWalletPrompt = () => {
    setShowNewWalletPrompt(false);
  };
  const handleViewRecoveryPhrase = () => {
    navigate(
      ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_WARNING,
      { state: { wallet, password: state?.password } },
    );
  };

  const handleViewPrivateKey = (account: Address) => {
    navigate(
      ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__PKEY_WARNING,
      { state: { account, password: state?.password } },
    );
  };

  const fetchWallet = async () => {
    const fetchedWallet = await getWallet(state?.wallet?.accounts?.[0]);
    setWallet(fetchedWallet);
  };
  useEffect(() => {
    if (state?.wallet?.accounts?.[0]) {
      fetchWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.wallet?.accounts?.[0]]);

  const { currentAddress, setCurrentAddress } = useCurrentAddressStore();
  const { unhideWallet, hiddenWallets } = useHiddenWalletsStore();
  const { visibleWallets } = useWallets();

  const handleRemoveAccount = async (address: Address) => {
    const walletBeforeDeletion = await getWallet(address);
    unhideWallet({ address });
    await remove(address);
    // set current address to the next account if you deleted that one
    if (address === currentAddress) {
      const deletedIndex = visibleWallets.findIndex(
        (account) => account.address === address,
      );
      const nextIndex =
        deletedIndex === visibleWallets.length - 1
          ? deletedIndex - 1
          : deletedIndex + 1;
      setCurrentAddress(visibleWallets[nextIndex].address);
    }
    // if more accounts in this wallet
    const otherAccountSameWallet = walletBeforeDeletion.accounts.find(
      (a) => a !== address,
    );
    if (otherAccountSameWallet) {
      const walletAfterDeletion = await getWallet(otherAccountSameWallet);
      setWallet(walletAfterDeletion);
    } else {
      navigate(ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS);
    }
  };

  return (
    <Box>
      <NewWalletPrompt
        wallet={wallet}
        show={showNewWalletPrompt}
        onClose={handleCloseNewWalletPrompt}
      />
      <RenameWalletPrompt
        show={!!renameAccount}
        account={renameAccount}
        onClose={() => {
          setRenameAccount(undefined);
        }}
      />
      <RemoveWalletPrompt
        show={!!removeAccount}
        account={removeAccount}
        onClose={() => {
          setRemoveAccount(undefined);
        }}
        onRemoveAccount={handleRemoveAccount}
      />
      <Box paddingHorizontal="20px">
        <MenuContainer testId="settings-menu-container">
          <Menu>
            <MenuItem
              titleComponent={
                <MenuItem.Title
                  text={i18n.t(
                    'settings.privacy_and_security.wallets_and_keys.wallet_details.view_recovery_phrase',
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
              onClick={handleViewRecoveryPhrase}
            />
          </Menu>
          <Menu paddingVertical="8px">
            {wallet?.accounts.map((account: Address) => {
              return (
                <AccountItem
                  account={account}
                  key={account}
                  rightComponent={
                    <Inline alignVertical="center" space="10px">
                      {hiddenWallets[account] && (
                        <LabelPill
                          label={i18n.t(
                            'settings.privacy_and_security.wallets_and_keys.wallet_details.hidden',
                          )}
                        />
                      )}
                      <MoreInfoButton
                        options={InfoButtonOptions({
                          account,
                          handleViewPrivateKey,
                          setRenameAccount,
                          setRemoveAccount,
                          unhideWallet: hiddenWallets[account]
                            ? (address: Address) => unhideWallet({ address })
                            : undefined,
                        })}
                      />
                    </Inline>
                  }
                  labelType={LabelOption.address}
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
                    'settings.privacy_and_security.wallets_and_keys.wallet_details.create_new_wallet',
                  )}
                  color="blue"
                />
              }
              onClick={handleOpenNewWalletPrompt}
            />
          </Menu>
        </MenuContainer>
      </Box>
    </Box>
  );
}
