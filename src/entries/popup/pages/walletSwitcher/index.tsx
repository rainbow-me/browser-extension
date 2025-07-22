import { motion } from 'framer-motion';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { Address } from 'viem';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { useHiddenWalletsStore } from '~/core/state/hiddenWallets';
import { useWalletNamesStore } from '~/core/state/walletNames';
import { useWalletOrderStore } from '~/core/state/walletOrder';
import { KeychainType } from '~/core/types/keychainTypes';
import { truncateAddress } from '~/core/utils/address';
import { reorder } from '~/core/utils/draggable';
import {
  AccentColorProvider,
  Box,
  Button,
  Inline,
  Stack,
  Text,
} from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { Symbol, SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { globalColors } from '~/design-system/styles/designTokens';

import AccountItem, {
  LabelOption,
} from '../../components/AccountItem/AccountItem';
import { DraggableContext, DraggableItem } from '../../components/Draggable';
import { LabelPill } from '../../components/LabelPill/LabelPill';
import { Link } from '../../components/Link/Link';
import {
  MoreInfoButton,
  MoreInfoOption,
} from '../../components/MoreInfoButton/MoreInfoButton';
import { QuickPromo } from '../../components/QuickPromo/QuickPromo';
import { triggerToast } from '../../components/Toast/Toast';
import { getWallet, remove, wipe } from '../../handlers/wallet';
import { Account, useAccounts } from '../../hooks/useAccounts';
import { useAvatar } from '../../hooks/useAvatar';
import { useBrowser } from '../../hooks/useBrowser';
import useKeyboardAnalytics from '../../hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { SwitchWalletShortcuts } from '../../hooks/useSwitchWalletShortcuts';
import { AddressAndType, useWallets } from '../../hooks/useWallets';
import { ROUTES } from '../../urls';

import { RemoveWalletPrompt } from './removeWalletPrompt';
import { RenameWalletPrompt } from './renameWalletPrompt';

const infoButtonOptions = ({
  account,
  isLastWallet,
  setRenameAccount,
  setRemoveAccount,
}: {
  account: AddressAndType;
  isLastWallet: boolean;
  setRenameAccount: React.Dispatch<React.SetStateAction<Address | undefined>>;
  setRemoveAccount: React.Dispatch<
    React.SetStateAction<AddressAndType | undefined>
  >;
  hide?: boolean;
}): MoreInfoOption[] => {
  const isWatchedWallet = account.type === KeychainType.ReadOnlyKeychain;

  return [
    {
      onSelect: () => {
        setRenameAccount(account.address);
      },
      label: i18n.t('wallet_switcher.rename_wallet'),
      symbol: 'person.crop.circle.fill',
    },
    {
      onSelect: () => {
        navigator.clipboard.writeText(account.address as string);
        triggerToast({
          title: i18n.t('wallet_header.copy_toast'),
          description: truncateAddress(account.address),
        });
      },
      label: i18n.t('wallet_switcher.copy_address'),
      subLabel: truncateAddress(account.address),
      symbol: 'doc.on.doc.fill',
    },
    {
      onSelect: () => setRemoveAccount(account),
      label: i18n.t(
        `wallet_switcher.${isWatchedWallet ? 'remove_wallet' : 'hide_wallet'}`,
      ),
      symbol: isWatchedWallet ? 'trash.fill' : 'eye.slash.circle.fill',
      color: 'red',
      disabled: isLastWallet,
    },
  ] satisfies MoreInfoOption[];
};

const NoWalletsWarning = ({
  symbol,
  text,
}: {
  symbol: SymbolProps['symbol'];
  text: string;
}) => (
  <Box
    alignItems="center"
    justifyContent="center"
    paddingTop="104px"
    as={motion.div}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <Stack alignHorizontal="center" space="8px">
      <Symbol symbol={symbol} weight="bold" size={32} color="labelQuaternary" />
      <Text size="20pt" weight="bold" color="labelQuaternary">
        {text}
      </Text>
    </Stack>
  </Box>
);

interface WalletSearchData extends AddressAndType {
  walletName?: string;
  ensName?: string;
}

const AccountItemWithMenu = ({
  account,
  menuOptions,
  isSelected,
  onSelect,
  index,
}: {
  account: Account;
  onSelect: () => void;
  isSelected: boolean;
  menuOptions: MoreInfoOption[];
  index: number;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <AccountItem
      testId={`wallet-account-${index + 1}`}
      key={account.address}
      onClick={onSelect}
      onContextMenu={(e) => (e.preventDefault(), setIsMenuOpen(true))}
      account={account.address}
      rightComponent={
        <Inline alignVertical="center" space="6px">
          {account.type === KeychainType.ReadOnlyKeychain && (
            <LabelPill label={i18n.t('wallet_switcher.watching')} />
          )}
          {account.type === KeychainType.HardwareWalletKeychain && (
            <LabelPill
              dot
              label={i18n.t(`wallet_switcher.${account.vendor?.toLowerCase()}`)}
            />
          )}
          <MoreInfoButton
            open={isMenuOpen}
            onOpen={() => setIsMenuOpen(true)}
            onClose={() => setIsMenuOpen(false)}
            testId={`more-info-${index + 1}`}
            options={menuOptions}
          />
        </Inline>
      }
      labelType={LabelOption.balance}
      isSelected={isSelected}
    />
  );
};

export function WalletSwitcher() {
  const { isFirefox } = useBrowser();
  const [renameAccount, setRenameAccount] = useState<Address | undefined>();
  const [removeAccount, setRemoveAccount] = useState<
    AddressAndType | undefined
  >();
  const { currentAddress, setCurrentAddress } = useCurrentAddressStore();
  const { hideWallet, unhideWallet } = useHiddenWalletsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useRainbowNavigate();
  const { visibleWallets: accounts, fetchWallets } = useWallets();
  const { data: avatar } = useAvatar({ addressOrName: currentAddress });
  const { trackShortcut } = useKeyboardAnalytics();

  const isLastWallet = accounts?.length === 1;

  const { deleteWalletName } = useWalletNamesStore();

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSelectAddress = useCallback(
    (address: Address) => {
      setCurrentAddress(address);
      navigate(ROUTES.HOME, {
        state: { isBack: true, tab: 'tokens' },
      });
    },
    [navigate, setCurrentAddress],
  );

  const handleRemoveAccount = useCallback(
    async (address: Address) => {
      const walletToDelete = await getWallet(address);
      // remove if read-only
      if (walletToDelete?.type === KeychainType.ReadOnlyKeychain) {
        await remove(address);
      } else {
        // hide otherwise
        hideWallet({ address });
      }

      deleteWalletName({ address });

      // Switch to the next account if possible
      if (accounts.length > 1) {
        if (address === currentAddress) {
          const deletedIndex = accounts.findIndex(
            (account) => account.address === address,
          );
          const nextIndex =
            deletedIndex === accounts.length - 1
              ? deletedIndex - 1
              : deletedIndex + 1;
          setCurrentAddress(accounts[nextIndex]?.address);
        }
        // fetch the wallets from the keychain again
        await fetchWallets();
      } else {
        // This was the last account wipe and send to welcome screen
        unhideWallet({ address });
        await wipe();
        navigate(ROUTES.WELCOME);
      }
    },
    [
      deleteWalletName,
      accounts,
      unhideWallet,
      hideWallet,
      currentAddress,
      fetchWallets,
      setCurrentAddress,
      navigate,
    ],
  );

  const isSearching = !!searchQuery;

  const saveWalletOrder = useWalletOrderStore((state) => state.saveWalletOrder);

  const { filteredAndSortedAccounts, sortedAccounts } = useAccounts(
    ({ sortedAccounts }) => ({
      sortedAccounts,
      filteredAndSortedAccounts: sortedAccounts.filter(
        ({ address, walletName, ensName }) =>
          address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          walletName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ensName?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }),
  );
  const displayedAccounts = useMemo(
    () =>
      filteredAndSortedAccounts.map((account, index) => (
        <DraggableItem
          key={account.address}
          id={account.address}
          index={index}
          isDragDisabled={isSearching}
        >
          <AccountItemWithMenu
            account={account}
            onSelect={() => handleSelectAddress(account.address)}
            isSelected={account.address === currentAddress}
            index={index}
            menuOptions={infoButtonOptions({
              account,
              setRenameAccount,
              setRemoveAccount,
              isLastWallet,
            })}
          />
        </DraggableItem>
      )),
    [
      currentAddress,
      filteredAndSortedAccounts,
      handleSelectAddress,
      isLastWallet,
      isSearching,
    ],
  );

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.index === source.index) return;
    const newAccountsWithNamesAndEns = reorder(
      sortedAccounts,
      source.index,
      destination.index,
    ) as WalletSearchData[];
    saveWalletOrder(newAccountsWithNamesAndEns.map(({ address }) => address));
  };

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (
        e.key === shortcuts.wallet_switcher.SEARCH.key &&
        document.activeElement !== searchInputRef.current
      ) {
        trackShortcut({
          key: shortcuts.wallet_switcher.SEARCH.display,
          type: 'walletSwitcher.search',
        });
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
    },
  });

  return (
    <Box
      style={{ minHeight: 0, height: '100vh' }}
      display="flex"
      flexDirection="column"
    >
      <SwitchWalletShortcuts />
      <RenameWalletPrompt
        account={renameAccount}
        onClose={() => setRenameAccount(undefined)}
      />
      <RemoveWalletPrompt
        show={!!removeAccount}
        account={removeAccount?.address}
        onClose={() => {
          setRemoveAccount(undefined);
        }}
        onRemoveAccount={handleRemoveAccount}
        hide={removeAccount?.type !== KeychainType.ReadOnlyKeychain}
      />
      <Box
        paddingHorizontal="16px"
        display="flex"
        flexDirection="column"
        gap="12px"
        paddingBottom="8px"
      >
        <Input
          height="32px"
          variant="bordered"
          placeholder={i18n.t('wallet_switcher.search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          innerRef={searchInputRef}
          tabIndex={0}
          autoFocus
        />
        <QuickPromo
          text={i18n.t('wallet_switcher.quick_promo.text')}
          textBold={i18n.t('wallet_switcher.quick_promo.text_bold')}
          symbol="sparkle"
          symbolColor="accent"
          promoType="wallet_switcher"
        />
      </Box>
      <DraggableContext onDragEnd={onDragEnd}>
        <Box paddingHorizontal="8px" paddingVertical="4px">
          {displayedAccounts.length !== 0 && (
            <AccentColorProvider color={avatar?.color || globalColors.blue60}>
              {displayedAccounts}
            </AccentColorProvider>
          )}
          {isSearching && displayedAccounts.length === 0 && (
            <NoWalletsWarning
              symbol="magnifyingglass.circle.fill"
              text={i18n.t('wallet_switcher.no_results')}
            />
          )}
        </Box>
      </DraggableContext>
      <Box
        width="full"
        style={{ marginTop: 'auto' }}
        backdropFilter="opacity(5%)"
        padding="20px"
        borderWidth="1px"
        borderColor="separatorTertiary"
        background="surfaceSecondary"
        display="flex"
        flexDirection="column"
        gap="8px"
      >
        <Link to={ROUTES.ADD_WALLET}>
          <Button
            color="blue"
            variant="flat"
            symbol="plus.circle.fill"
            symbolSide="left"
            height="32px"
            width="full"
            borderRadius="9px"
            testId={'add-wallet-button'}
            tabIndex={0}
          >
            {i18n.t('wallet_switcher.add_another_wallet')}
          </Button>
        </Link>
        {config.hw_wallets_enabled && !isFirefox && (
          <Link to={ROUTES.HW_CHOOSE}>
            <Button
              color="fillSecondary"
              variant="flat"
              symbol="doc.text.magnifyingglass"
              symbolSide="left"
              height="32px"
              width="full"
              borderRadius="9px"
              tabIndex={0}
            >
              {i18n.t('wallet_switcher.connect_hardware_wallet')}
            </Button>
          </Link>
        )}
        {process.env.IS_DEV === 'true' && (
          <Link to={ROUTES.WALLETS}>
            <Button
              color="fillSecondary"
              variant="flat"
              symbol="gearshape.fill"
              symbolSide="left"
              height="32px"
              width="full"
              borderRadius="9px"
              tabIndex={0}
            >
              Old Wallets UI [DEV]
            </Button>
          </Link>
        )}
      </Box>
    </Box>
  );
}
