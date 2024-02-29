import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useHiddenWalletsStore } from '~/core/state/hiddenWallets';
import { useWalletBackupsStore } from '~/core/state/walletBackups';
import { useWalletNamesStore } from '~/core/state/walletNames';
import { KeychainType, KeychainWallet } from '~/core/types/keychainTypes';
import { truncateAddress } from '~/core/utils/address';
import { formatDate } from '~/core/utils/formatDate';
import { getSettingWallets } from '~/core/utils/settings';
import { Box, Inline, Symbol, Text } from '~/design-system';
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
import { add, getWallet, remove, wipe } from '~/entries/popup/handlers/wallet';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { ROUTES } from '~/entries/popup/urls';

import { CreateWalletPrompt } from '../../walletSwitcher/createWalletPrompt';
import { RemoveWalletPrompt } from '../../walletSwitcher/removeWalletPrompt';
import { RenameWalletPrompt } from '../../walletSwitcher/renameWalletPrompt';
import { ConfirmPasswordPrompt } from '../privacy/confirmPasswordPrompt';

import { HardwareWalletWipePrompt } from './hardwareWalletWipePrompt';

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
    },
    {
      label: i18n.t('wallet.edit_appearance'),
      symbol: 'paintbrush.pointed.fill',
      onSelect: () => void {},
      disabled: true,
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
  const [renameAccount, setRenameAccount] = useState<Address | undefined>();
  const [removeAccount, setRemoveAccount] = useState<Address | undefined>();
  const [wallet, setWallet] = useState<KeychainWallet | null>();
  const { currentAddress, setCurrentAddress } = useCurrentAddressStore();
  const { unhideWallet, hiddenWallets } = useHiddenWalletsStore();
  const { visibleWallets } = useWallets();
  const { deleteWalletName } = useWalletNamesStore();
  const [createWalletAddress, setCreateWalletAddress] = useState<Address>();
  const [showEnterPassword, setShowEnterPassword] = useState(false);
  const [showHardwareWalletWipe, setShowHardwareWalletWipe] = useState(false);

  const { isWalletBackedUp, getWalletBackup, deleteWalletBackup } =
    useWalletBackupsStore();

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

  useEffect(() => {
    const _getWallet = async () => {
      const settingWallet = await getSettingWallets();
      const wallet = await getWallet(settingWallet.accounts[0]);
      setWallet(wallet);
    };
    _getWallet();
  }, []);

  const handleCreateWalletOnGroup = useCallback(async () => {
    const currentWallets = await getSettingWallets();
    const sibling = currentWallets.accounts[0];
    const address = await add(sibling);
    setCreateWalletAddress(address);
  }, []);

  const handleRemoveAccount = async (address: Address) => {
    const walletBeforeDeletion = await getWallet(address);
    unhideWallet({ address });
    await remove(address);
    deleteWalletName({ address });
    deleteWalletBackup({ address });

    if (visibleWallets.length > 1) {
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
      const otherAccountSameWallet = walletBeforeDeletion?.accounts.find(
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

  const handleCancel = async () => {
    if (createWalletAddress !== undefined) {
      await handleRemoveAccount(createWalletAddress);
    }
    setCreateWalletAddress(undefined);
  };

  const onClose = () => {
    setCreateWalletAddress(undefined);
  };

  const walletBackedUp = useMemo(() => {
    if (wallet) {
      return isWalletBackedUp({ wallet });
    }
    return true;
  }, [isWalletBackedUp, wallet]);

  const walletBackedUpInfo = useMemo(() => {
    if (wallet) {
      return getWalletBackup({ wallet });
    }
    return null;
  }, [getWalletBackup, wallet]);

  const handleViewRecoveryPhrase = useCallback(() => {
    navigate(
      ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_WARNING,
      {
        state: { wallet, password: state?.password, showQuiz: !walletBackedUp },
      },
    );
  }, [navigate, state?.password, wallet, walletBackedUp]);

  const handleBackup = useCallback(() => {
    navigate(
      ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_WARNING,
      {
        state: { wallet, showQuiz: true, fromChooseGroup: true },
      },
    );
  }, [navigate, wallet]);

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

  return (
    <Box>
      <ConfirmPasswordPrompt
        show={showEnterPassword}
        onClose={() => setShowEnterPassword(false)}
        extraState={{ ...state }}
        onSuccess={() =>
          navigate(
            ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__WIPE_WALLET_GROUP_WARNING,
          )
        }
      />
      <CreateWalletPrompt
        onCancel={handleCancel}
        show={!!createWalletAddress}
        onClose={onClose}
        address={createWalletAddress}
        fromChooseGroup={true}
      />
      <RenameWalletPrompt
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
      <HardwareWalletWipePrompt
        show={showHardwareWalletWipe}
        onClose={() => setShowHardwareWalletWipe(false)}
      />
      <Box paddingHorizontal="20px">
        <MenuContainer testId="settings-menu-container">
          {wallet?.type !== KeychainType.HardwareWalletKeychain &&
            walletBackedUp && (
              <Menu>
                <MenuItem
                  testId={'view-recovery-phrase'}
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
          {!walletBackedUp && (
            <Menu>
              <MenuItem
                first
                last
                titleComponent={
                  <MenuItem.Title
                    text={i18n.t(
                      'settings.privacy_and_security.wallets_and_keys.wallet_details.back_up_now',
                    )}
                  />
                }
                leftComponent={
                  <Symbol
                    symbol="exclamationmark.circle.fill"
                    weight="medium"
                    size={18}
                    color="red"
                  />
                }
                hasRightArrow
                onClick={handleBackup}
              />
            </Menu>
          )}
          {walletBackedUpInfo?.timestamp ? (
            <Box paddingHorizontal="12px">
              <Text
                size="12pt"
                weight="medium"
                color="labelQuaternary"
                align="left"
              >
                {i18n.t(
                  'settings.privacy_and_security.wallets_and_keys.wallet_details.last_backed_up',
                  { date: formatDate(walletBackedUpInfo?.timestamp) },
                )}
              </Text>
            </Box>
          ) : null}
          <Menu>
            {wallet?.accounts?.map((account: Address, numOfWallets) => {
              return (
                <WalletRow
                  key={account}
                  account={account}
                  hiddenWallets={hiddenWallets}
                  handleViewPrivateKey={handleViewPrivateKey}
                  setRenameAccount={setRenameAccount}
                  renameAccount={renameAccount}
                  setRemoveAccount={setRemoveAccount}
                  unhideWallet={unhideWallet}
                  type={wallet?.type}
                  numOfWallets={numOfWallets + 1}
                />
              );
            })}
          </Menu>
          {wallet?.type === KeychainType.HardwareWalletKeychain && (
            <Menu>
              <MenuItem
                first
                last
                leftComponent={
                  <Symbol
                    size={18}
                    color="red"
                    weight="medium"
                    symbol="trash.fill"
                  />
                }
                titleComponent={
                  <MenuItem.Title
                    text={i18n.t(
                      'settings.privacy_and_security.wallets_and_keys.wipe_hardware_wallet_group.delete',
                      {
                        vendor: wallet.vendor,
                      },
                    )}
                    color="red"
                  />
                }
                onClick={() => setShowHardwareWalletWipe(true)}
              />
            </Menu>
          )}
          {wallet?.type === KeychainType.HdKeychain && (
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
                onClick={handleCreateWalletOnGroup}
              />
              <MenuItem
                first
                last
                leftComponent={
                  <Symbol
                    size={18}
                    color="red"
                    weight="medium"
                    symbol="trash.fill"
                  />
                }
                titleComponent={
                  <MenuItem.Title
                    text={i18n.t(
                      'settings.privacy_and_security.wallets_and_keys.wipe_wallet_group.delete',
                    )}
                    color="red"
                  />
                }
                onClick={() => setShowEnterPassword(true)}
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
  renameAccount,
  setRemoveAccount,
  unhideWallet,
  type,
  numOfWallets,
}: {
  account: Address;
  hiddenWallets: Record<Address, boolean>;
  handleViewPrivateKey: (account: Address) => void;
  setRenameAccount: React.Dispatch<React.SetStateAction<Address | undefined>>;
  renameAccount?: Address;
  setRemoveAccount: React.Dispatch<React.SetStateAction<Address | undefined>>;
  unhideWallet: ({ address }: { address: Address }) => void;
  type: KeychainType;
  numOfWallets: number;
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

  if (menuOpen && renameAccount) {
    setMenuOpen(false);
  }

  return (
    <Box testId={`wallet-item-${numOfWallets}`}>
      <AccountItem
        testId={
          hiddenWallets[account]
            ? `hidden-wallet-${account}`
            : `wallet-${account}`
        }
        onClick={() => setMenuOpen(true)}
        onContextMenu={(e) => (e.preventDefault(), setMenuOpen(true))}
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
    </Box>
  );
};
