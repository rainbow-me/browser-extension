import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useHiddenWalletsStore } from '~/core/state/hiddenWallets';
import { useWalletNamesStore } from '~/core/state/walletNames';
import { KeychainType, KeychainWallet } from '~/core/types/keychainTypes';
import { truncateAddress } from '~/core/utils/address';
import { getSettingWallets } from '~/core/utils/settings';
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
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { getWallet, remove, wipe } from '~/entries/popup/handlers/wallet';
import { useVisibleAccounts } from '~/entries/popup/hooks/useAccounts';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
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
}): MoreInfoOption[] => {
  const options = [
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
        triggerToast({
          title: i18n.t('wallet_header.copy_toast'),
          description: truncateAddress(account),
        });
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

  if (handleViewPrivateKey) {
    options.unshift({
      onSelect: () => {
        handleViewPrivateKey(account);
      },
      label: i18n.t(
        'settings.privacy_and_security.wallets_and_keys.wallet_details.view_private_key',
      ),
      symbol: 'key.fill',
    });
  }

  return options as MoreInfoOption[];
};

export function WalletDetails() {
  const navigate = useRainbowNavigate();
  const { state } = useLocation();
  const [showNewWalletPrompt, setShowNewWalletPrompt] = useState(false);
  const [renameAccount, setRenameAccount] = useState<Address | undefined>();
  const [removeAccount, setRemoveAccount] = useState<Address | undefined>();

  const [wallet, setWallet] = useState<KeychainWallet | null>();

  const handleOpenNewWalletPrompt = useCallback(() => {
    setShowNewWalletPrompt(true);
  }, []);

  const handleCloseNewWalletPrompt = useCallback(() => {
    setShowNewWalletPrompt(false);
  }, []);

  const handleViewRecoveryPhrase = useCallback(() => {
    navigate(
      ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_WARNING,
      { state: { wallet, password: state?.password, showQuiz: false } },
    );
  }, [navigate, state?.password, wallet]);

  const handleViewPrivateKey = useCallback(
    (account: Address) => {
      navigate(
        ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__PKEY_WARNING,
        {
          state: {
            wallet,
            account,
            password: state?.password,
          },
        },
      );
    },
    [navigate, state?.password, wallet],
  );

  const handleViewSecret = useCallback(() => {
    if (wallet?.type === KeychainType.HdKeychain) {
      handleViewRecoveryPhrase();
    } else {
      handleViewPrivateKey(wallet?.accounts[0] as Address);
    }
  }, [
    handleViewPrivateKey,
    handleViewRecoveryPhrase,
    wallet?.accounts,
    wallet?.type,
  ]);

  useEffect(() => {
    const getWallet = async () => {
      const wallet = await getSettingWallets();
      setWallet(wallet);
    };
    getWallet();
  }, []);

  const { currentAddress, setCurrentAddress } = useCurrentAddressStore();
  const { unhideWallet, hiddenWallets } = useHiddenWalletsStore();
  const { accounts } = useVisibleAccounts();
  const { deleteWalletName } = useWalletNamesStore();

  const handleRemoveAccount = async (address: Address) => {
    const walletBeforeDeletion = await getWallet(address);
    unhideWallet({ address });
    await remove(address);
    deleteWalletName({ address });

    if (accounts.length > 1) {
      // set current address to the next account if you deleted that one
      if (address === currentAddress) {
        const deletedIndex = accounts.findIndex(
          (account) => account.address === address,
        );
        const nextIndex =
          deletedIndex === accounts.length - 1
            ? deletedIndex - 1
            : deletedIndex + 1;
        setCurrentAddress(accounts[nextIndex].address);
      }
      // if more accounts in this wallet
      const otherAccountSameWallet = walletBeforeDeletion.accounts.find(
        (a) => a !== address,
      );
      if (otherAccountSameWallet) {
        const walletAfterDeletion = await getWallet(otherAccountSameWallet);
        setWallet(walletAfterDeletion);
      } else {
        navigate(-1);
      }
    } else {
      await wipe();
      navigate(ROUTES.WELCOME);
    }
  };

  return (
    <Box>
      {wallet && (
        <NewWalletPrompt
          wallet={wallet as KeychainWallet}
          show={showNewWalletPrompt}
          onClose={handleCloseNewWalletPrompt}
        />
      )}
      <RenameWalletPrompt
        account={renameAccount}
        onClose={() => setRenameAccount(undefined)}
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
          {wallet?.type !== KeychainType.HardwareWalletKeychain && (
            <Menu>
              <MenuItem
                first
                last
                titleComponent={
                  <MenuItem.Title
                    text={i18n.t(
                      wallet?.type === KeychainType.HdKeychain
                        ? 'settings.privacy_and_security.wallets_and_keys.wallet_details.view_recovery_phrase'
                        : 'settings.privacy_and_security.wallets_and_keys.wallet_details.view_private_key',
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
                onClick={handleViewSecret}
              />
            </Menu>
          )}
          <Menu>
            {wallet?.accounts?.map((account: Address) => {
              return (
                <WalletRow
                  key={account}
                  account={account}
                  hiddenWallets={hiddenWallets}
                  handleViewPrivateKey={handleViewPrivateKey}
                  setRenameAccount={setRenameAccount}
                  setRemoveAccount={setRemoveAccount}
                  unhideWallet={unhideWallet}
                  type={wallet?.type}
                />
              );
            })}
          </Menu>
          {wallet?.type !== KeychainType.HardwareWalletKeychain && (
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
                      'settings.privacy_and_security.wallets_and_keys.wallet_details.create_new_wallet',
                    )}
                    color="blue"
                  />
                }
                onClick={handleOpenNewWalletPrompt}
              />
            </Menu>
          )}
        </MenuContainer>
      </Box>
    </Box>
  );
}

const WalletRow = ({
  account,
  hiddenWallets,
  handleViewPrivateKey,
  setRenameAccount,
  setRemoveAccount,
  unhideWallet,
  type,
}: {
  account: Address;
  hiddenWallets: Record<Address, boolean>;
  handleViewPrivateKey: (account: Address) => void;
  setRenameAccount: React.Dispatch<React.SetStateAction<Address | undefined>>;
  setRemoveAccount: React.Dispatch<React.SetStateAction<Address | undefined>>;
  unhideWallet: ({ address }: { address: Address }) => void;
  type: KeychainType;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const opts = {
    account,
    setRenameAccount,
    setRemoveAccount,
    unhideWallet: hiddenWallets[account]
      ? (address: Address) => unhideWallet({ address })
      : undefined,
    handleViewPrivateKey:
      type !== KeychainType.HardwareWalletKeychain
        ? handleViewPrivateKey
        : undefined,
  } as unknown as typeof InfoButtonOptions;

  return (
    <AccountItem
      onClick={() => setMenuOpen(true)}
      key={account}
      account={account}
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
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            onOpen={() => setMenuOpen(true)}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            options={InfoButtonOptions(opts)}
          />
        </Inline>
      }
      labelType={LabelOption.address}
    />
  );
};
