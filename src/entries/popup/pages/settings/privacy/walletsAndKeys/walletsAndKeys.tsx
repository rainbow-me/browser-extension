/* eslint-disable no-nested-ternary */
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useHiddenWalletsStore } from '~/core/state/hiddenWallets';
import { useWalletBackupsStore } from '~/core/state/walletBackups';
import { KeychainType, KeychainWallet } from '~/core/types/keychainTypes';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { setSettingWallets } from '~/core/utils/settings';
import { Box, Button, Inline, Separator, Symbol, Text } from '~/design-system';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '~/entries/popup/components/ContextMenu/ContextMenu';
import { LedgerIcon } from '~/entries/popup/components/LedgerIcon/LedgerIcon';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { TrezorIcon } from '~/entries/popup/components/TrezorIcon/TrezorIcon';
import { add, getWallets, remove } from '~/entries/popup/handlers/wallet';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

import { CreateWalletPrompt } from '../../../walletSwitcher/createWalletPrompt';

const t = (s: string) =>
  i18n.t(s, { scope: 'settings.privacy_and_security.wallets_and_keys' });

function useCreateWalletPrompt() {
  const [address, setAddress] = useState<Address>();

  const createWithSibling = (sibling: Address) => add(sibling).then(setAddress);
  const close = () => setAddress(undefined);
  const cancel = async () => {
    if (address) await remove(address);
    close();
  };

  return {
    isOpen: !!address,
    address,
    createWithSibling,
    close,
    cancel,
  };
}
function WalletsAndKeysContextMenu({
  children,
  wallet,
}: PropsWithChildren<{ wallet: KeychainWallet }>) {
  const navigate = useRainbowNavigate();

  const { isOpen, address, createWithSibling, close, cancel } =
    useCreateWalletPrompt();

  const { hideWallet, unhideWallet, hiddenWallets } = useHiddenWalletsStore();
  const { accounts } = wallet;

  const hideWallets = () =>
    accounts.forEach((address) => hideWallet({ address }));
  const unhideWallets = () =>
    accounts.forEach((address) => unhideWallet({ address }));

  const isAllHidden = accounts.every((account) => !!hiddenWallets[account]);

  return (
    <>
      <CreateWalletPrompt
        onCancel={cancel}
        show={isOpen}
        onClose={close}
        address={address}
        fromChooseGroup={true}
      />
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div>{children}</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            symbolLeft="lock.square.fill"
            onSelect={() =>
              navigate(
                ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_WARNING,
                { state: { wallet } },
              )
            }
          >
            {t('context_menu.view_secret_phrase')}
          </ContextMenuItem>
          <ContextMenuItem
            symbolLeft="plus.circle.fill"
            onSelect={() => {
              const sibling = wallet.accounts.at(-1);
              if (sibling) createWithSibling(sibling);
            }}
          >
            {t('context_menu.create_wallet')}
          </ContextMenuItem>
          <Separator color="separatorSecondary" />
          {isAllHidden ? (
            <ContextMenuItem
              symbolLeft="eye.slash.circle.fill"
              onSelect={unhideWallets}
            >
              {t('context_menu.unhide_wallets')}
            </ContextMenuItem>
          ) : (
            <ContextMenuItem
              color="red"
              symbolLeft="eye.slash.circle.fill"
              onSelect={hideWallets}
            >
              {t('context_menu.hide_wallets')}
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}

export const WalletsAndKeys = () => {
  const navigate = useRainbowNavigate();
  const [wallets, setWallets] = useState<KeychainWallet[]>([]);
  const { getWalletBackup } = useWalletBackupsStore();
  const firstNotBackedUpRef = useRef<HTMLDivElement>(null);
  const { state } = useLocation();

  useEffect(() => {
    setSettingWallets(null);
  }, []);

  const handleViewWallet = useCallback(
    async ({ wallet }: { wallet: KeychainWallet }) => {
      setSettingWallets(wallet);
      navigate(ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS, {
        state: { wallet },
      });
    },
    [navigate],
  );

  const handleBackup = useCallback(
    ({ wallet }: { wallet: KeychainWallet }) => {
      navigate(
        ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_WARNING,
        {
          state: { wallet, showQuiz: true, fromChooseGroup: true },
        },
      );
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

  const containerRef = useContainerRef();

  useEffect(() => {
    if (state.fromBackupReminder) {
      setTimeout(() => {
        if (containerRef?.current?.scrollTop !== undefined) {
          const topPosition =
            firstNotBackedUpRef?.current?.getBoundingClientRect().top || 0;
          containerRef.current.scrollTo({
            top: topPosition > POPUP_DIMENSIONS.height / 2 ? topPosition : 0,
            behavior: 'smooth',
          });
        }
      }, 500);
    }
  }, [containerRef, state?.fromBackupReminder]);

  return (
    <Box height="full" style={{ height: '100%' }} paddingHorizontal="20px">
      <MenuContainer>
        {wallets.map((wallet, idx) => {
          const walletBackedUp = getWalletBackup({ wallet });
          const singleAccount = wallet.accounts.length === 1;
          const importedLabel = walletBackedUp?.timestamp
            ? `${i18n.t(
                'settings.privacy_and_security.wallets_and_keys.backed_up',
              )} ‧`
            : !walletBackedUp
            ? `${i18n.t(
                'settings.privacy_and_security.wallets_and_keys.not_backed_up',
              )} ‧`
            : wallet.imported || wallet.type === KeychainType.KeyPairKeychain
            ? `${i18n.t(
                'settings.privacy_and_security.wallets_and_keys.imported',
              )} ‧`
            : '';

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

          const firstNotBackedUp =
            !walletBackedUp && !firstNotBackedUpRef.current;

          return (
            <WalletsAndKeysContextMenu key={idx} wallet={wallet}>
              <Menu ref={firstNotBackedUp ? firstNotBackedUpRef : undefined}>
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
                  onClick={() => handleViewWallet({ wallet })}
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
                {walletBackedUp?.backedUp ? null : (
                  <Box paddingHorizontal="16px" paddingVertical="16px">
                    <Inline alignHorizontal="center" alignVertical="center">
                      <Button
                        width="full"
                        color="red"
                        height="36px"
                        variant="tinted"
                        onClick={() => handleBackup({ wallet })}
                      >
                        {t('back_up_now')}
                      </Button>
                    </Inline>
                  </Box>
                )}
              </Menu>
            </WalletsAndKeysContextMenu>
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
              <MenuItem.Title text={t('create_a_new_wallet')} color="blue" />
            }
            onClick={handleCreateNewWallet}
          />
        </Menu>
      </MenuContainer>
    </Box>
  );
};

WalletsAndKeys.displayName = 'WalletsAndKeys';
