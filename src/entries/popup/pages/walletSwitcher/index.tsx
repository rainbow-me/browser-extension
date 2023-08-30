/* eslint-disable react/jsx-props-no-spreading */
import { motion } from 'framer-motion';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DraggableStateSnapshot,
  DraggingStyle,
  DropResult,
  Droppable,
  NotDraggingStyle,
} from 'react-beautiful-dnd';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useHiddenWalletsStore } from '~/core/state/hiddenWallets';
import { useWalletNamesStore } from '~/core/state/walletNames';
import { useWalletOrderStore } from '~/core/state/walletOrder';
import { KeychainType } from '~/core/types/keychainTypes';
import { truncateAddress } from '~/core/utils/address';
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
import { TextStyles } from '~/design-system/styles/core.css';
import { globalColors } from '~/design-system/styles/designTokens';

import AccountItem, {
  LabelOption,
} from '../../components/AccountItem/AccountItem';
import { LabelPill } from '../../components/LabelPill/LabelPill';
import { Link } from '../../components/Link/Link';
import {
  MoreInfoButton,
  MoreInfoOption,
} from '../../components/MoreInfoButton/MoreInfoButton';
import { QuickPromo } from '../../components/QuickPromo/QuickPromo';
import { triggerToast } from '../../components/Toast/Toast';
import { getWallet, remove, wipe } from '../../handlers/wallet';
import { useAccounts } from '../../hooks/useAccounts';
import { useAvatar } from '../../hooks/useAvatar';
import { useBrowser } from '../../hooks/useBrowser';
import useKeyboardAnalytics from '../../hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useSwitchWalletShortcuts } from '../../hooks/useSwitchWalletShortcuts';
import { AddressAndType, useWallets } from '../../hooks/useWallets';
import { ROUTES } from '../../urls';

import { accountItem } from './accountItem.css';
import { RemoveWalletPrompt } from './removeWalletPrompt';
import { RenameWalletPrompt } from './renameWalletPrompt';

const reorder = (
  list: Iterable<unknown>,
  startIndex: number,
  endIndex: number,
) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getItemStyle = (
  style: DraggingStyle | NotDraggingStyle | undefined,
  { dropAnimation }: Pick<DraggableStateSnapshot, 'dropAnimation'>,
) => {
  if (!dropAnimation) return style;
  const { moveTo, curve } = dropAnimation;
  return {
    ...style,
    transform: `translate(${moveTo.x}px, ${moveTo.y}px) scale(1)`,
    transition: `all ${curve} .5s`,
  };
};

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
  const options: MoreInfoOption[] = [
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
      separator: !isLastWallet,
    },
  ];

  const removeOption =
    account.type === KeychainType.ReadOnlyKeychain
      ? [
          {
            onSelect: () => {
              setRemoveAccount(account);
            },
            label: i18n.t('wallet_switcher.remove_wallet'),
            symbol: 'trash.fill' as SymbolProps['symbol'],
            color: 'red' as TextStyles['color'],
          },
        ]
      : [
          {
            onSelect: () => {
              setRemoveAccount(account);
            },
            label: i18n.t('wallet_switcher.hide_wallet'),
            symbol: 'eye.slash.circle.fill' as SymbolProps['symbol'],
            color: 'red' as TextStyles['color'],
          },
        ];

  return isLastWallet ? options : options.concat(removeOption);
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
  const { visibleWallets: accounts, allWallets, fetchWallets } = useWallets();
  const { avatar } = useAvatar({ address: currentAddress });
  const { featureFlags } = useFeatureFlagsStore();
  const { trackShortcut } = useKeyboardAnalytics();

  const isLastWallet = allWallets?.length === 1;

  const { deleteWalletName } = useWalletNamesStore();

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSelectAddress = useCallback(
    (address: Address) => {
      setCurrentAddress(address);
      navigate(ROUTES.HOME, {
        state: { isBack: true },
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
        await hideWallet({ address });
      }

      await deleteWalletName({ address });

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
        await unhideWallet({ address });
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

  const { saveWalletOrder } = useWalletOrderStore();

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
        <Draggable
          key={account.address}
          draggableId={account.address}
          index={index}
          isDragDisabled={isSearching}
        >
          {(
            { innerRef, draggableProps, dragHandleProps },
            { dropAnimation, isDragging },
          ) => (
            <Box
              ref={innerRef}
              {...draggableProps}
              {...dragHandleProps}
              style={getItemStyle(draggableProps.style, { dropAnimation })}
              tabIndex={-1}
            >
              <Box
                className={
                  accountItem[
                    isDragging && !dropAnimation ? 'dragging' : 'idle'
                  ]
                }
              >
                <AccountItem
                  testId={`wallet-account-${index + 1}`}
                  key={account.address}
                  onClick={() => handleSelectAddress(account.address)}
                  account={account.address}
                  rightComponent={
                    <Inline alignVertical="center" space="6px">
                      {account.type === KeychainType.ReadOnlyKeychain && (
                        <LabelPill label={i18n.t('wallet_switcher.watching')} />
                      )}
                      {account.type === KeychainType.HardwareWalletKeychain && (
                        <LabelPill
                          dot
                          label={i18n.t(
                            `wallet_switcher.${account.vendor?.toLowerCase()}`,
                          )}
                        />
                      )}
                      <MoreInfoButton
                        testId={`more-info-${index + 1}`}
                        options={infoButtonOptions({
                          account,
                          setRenameAccount,
                          setRemoveAccount,
                          isLastWallet,
                        })}
                      />
                    </Inline>
                  }
                  labelType={LabelOption.balance}
                  isSelected={account.address === currentAddress}
                />
              </Box>
            </Box>
          )}
        </Draggable>
      )),
    [
      currentAddress,
      filteredAndSortedAccounts,
      handleSelectAddress,
      isLastWallet,
      isSearching,
    ],
  );

  const displayedAccountsComponent = useMemo(
    () => (
      <AccentColorProvider color={avatar?.color || globalColors.blue60}>
        {displayedAccounts}
      </AccentColorProvider>
    ),
    [avatar?.color, displayedAccounts],
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

  // separate because this is used on other screens
  useSwitchWalletShortcuts();

  return (
    <Box
      style={{ minHeight: 0, height: '100vh' }}
      display="flex"
      flexDirection="column"
    >
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
        />
        <QuickPromo
          text={i18n.t('wallet_switcher.quick_promo.text')}
          textBold={i18n.t('wallet_switcher.quick_promo.text_bold')}
          symbol="sparkle"
          promoType="wallet_switcher"
        />
      </Box>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {({ droppableProps, innerRef, placeholder }) => (
            <Box
              {...droppableProps}
              ref={innerRef}
              style={{ overflowY: 'scroll' }}
              paddingHorizontal="8px"
              paddingVertical="4px"
            >
              {displayedAccounts.length !== 0 && (
                <Box
                  as={motion.div}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 1111,
                    damping: 50,
                    mass: 1,
                  }}
                  exit={{ opacity: 0 }}
                >
                  {displayedAccountsComponent}
                </Box>
              )}
              {isSearching && displayedAccounts.length === 0 && (
                <NoWalletsWarning
                  symbol="magnifyingglass.circle.fill"
                  text={i18n.t('wallet_switcher.no_results')}
                />
              )}
              {placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
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
          >
            {i18n.t('wallet_switcher.add_another_wallet')}
          </Button>
        </Link>
        {featureFlags.hw_wallets_enabled && !isFirefox && (
          <Link to={ROUTES.HW_CHOOSE}>
            <Button
              color="fillSecondary"
              variant="flat"
              symbol="doc.text.magnifyingglass"
              symbolSide="left"
              height="32px"
              width="full"
              borderRadius="9px"
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
            >
              Old Wallets UI [DEV]
            </Button>
          </Link>
        )}
      </Box>
    </Box>
  );
}
