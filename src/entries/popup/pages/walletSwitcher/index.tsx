/* eslint-disable react/jsx-props-no-spreading */
import { motion } from 'framer-motion';
import React, { useCallback, useMemo, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DraggingStyle,
  DropResult,
  Droppable,
  NotDraggingStyle,
} from 'react-beautiful-dnd';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
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
import { MenuContainer } from '../../components/Menu/MenuContainer';
import {
  MoreInfoButton,
  MoreInfoOption,
} from '../../components/MoreInfoButton/MoreInfoButton';
import { QuickPromo } from '../../components/QuickPromo/QuickPromo';
import { triggerToast } from '../../components/Toast/Toast';
import { getWallet, remove, wipe } from '../../handlers/wallet';
import { useAccounts } from '../../hooks/useAccounts';
import { useAvatar } from '../../hooks/useAvatar';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { AddressAndType, useWallets } from '../../hooks/useWallets';
import { ROUTES } from '../../urls';

import { WalletActionsMenu } from './WalletSwitcher.css';
import { RemoveWalletPrompt } from './removeWalletPrompt';
import { RenameWalletPrompt } from './renameWalletPrompt';

const { innerHeight: windowHeight } = window;

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
  isDragging: boolean,
  draggableStyle: DraggingStyle | NotDraggingStyle | undefined,
) => ({
  ...draggableStyle,
});

const infoButtonOptions = ({
  account,
  setRenameAccount,
  setRemoveAccount,
}: {
  account: AddressAndType;
  setRenameAccount: React.Dispatch<React.SetStateAction<Address | undefined>>;
  setRemoveAccount: React.Dispatch<
    React.SetStateAction<AddressAndType | undefined>
  >;
  hide?: boolean;
}): MoreInfoOption[] => [
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
    separator: true,
  },
  ...(account.type === KeychainType.ReadOnlyKeychain
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
      ]),
];

const bottomSpacing = 150 + (process.env.IS_DEV === 'true' ? 40 : 0);
const topSpacing = 127;

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
  const [renameAccount, setRenameAccount] = useState<Address | undefined>();
  const [removeAccount, setRemoveAccount] = useState<
    AddressAndType | undefined
  >();
  const { currentAddress, setCurrentAddress } = useCurrentAddressStore();
  const { hideWallet, unhideWallet } = useHiddenWalletsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useRainbowNavigate();
  const { visibleWallets: accounts, fetchWallets } = useWallets();
  const { avatar } = useAvatar({ address: currentAddress });

  const { deleteWalletName } = useWalletNamesStore();

  const handleSelectAddress = useCallback(
    (address: Address) => {
      setCurrentAddress(address);
      navigate(ROUTES.HOME);
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

  const { filteredAndSortedAccounts, sortedAccounts } =
    useAccounts(searchQuery);

  const displayedAccounts = useMemo(
    () =>
      filteredAndSortedAccounts.map((account, index) => (
        <Draggable
          key={account.address}
          draggableId={account.address}
          index={index}
          isDragDisabled={isSearching}
        >
          {(provided, snapshot) => (
            <Box
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={getItemStyle(
                snapshot.isDragging,
                provided.draggableProps.style,
              )}
              background={snapshot.isDragging ? 'surfaceSecondary' : undefined}
              borderRadius="12px"
            >
              <AccountItem
                rowHighlight
                key={account.address}
                onClick={() => {
                  handleSelectAddress(account.address);
                }}
                account={account.address}
                rightComponent={
                  <Inline alignVertical="center" space="6px">
                    {account.type === KeychainType.ReadOnlyKeychain && (
                      <LabelPill label={i18n.t('wallet_switcher.watching')} />
                    )}
                    <MoreInfoButton
                      options={infoButtonOptions({
                        account,
                        setRenameAccount,
                        setRemoveAccount,
                      })}
                    />
                  </Inline>
                }
                labelType={LabelOption.balance}
                isSelected={account.address === currentAddress}
              />
            </Box>
          )}
        </Draggable>
      )),
    [
      currentAddress,
      filteredAndSortedAccounts,
      handleSelectAddress,
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

  return (
    <Box height="full">
      <RenameWalletPrompt
        show={!!renameAccount}
        account={renameAccount}
        onClose={() => {
          setRenameAccount(undefined);
        }}
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
      <Box paddingHorizontal="16px" paddingBottom="12px">
        <Input
          height="32px"
          variant="bordered"
          placeholder={i18n.t('wallet_switcher.search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>
      <Box paddingHorizontal="16px" paddingBottom="8px">
        <QuickPromo
          text={i18n.t('wallet_switcher.quick_promo.text')}
          textBold={i18n.t('wallet_switcher.quick_promo.text_bold')}
          symbol="sparkle"
          promoType="wallet_switcher"
        />
      </Box>
      <Box style={{ overflow: 'scroll' }} paddingHorizontal="8px">
        <MenuContainer>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <Box {...provided.droppableProps} ref={provided.innerRef}>
                  <Box
                    width="full"
                    height="full"
                    style={{
                      overflow: 'scroll',
                      height: windowHeight - bottomSpacing - topSpacing,
                    }}
                  >
                    <Stack>
                      {displayedAccounts.length !== 0 && (
                        <Box
                          as={motion.div}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {displayedAccountsComponent}
                        </Box>
                      )}
                    </Stack>
                    {isSearching && displayedAccounts.length === 0 && (
                      <NoWalletsWarning
                        symbol="magnifyingglass.circle.fill"
                        text={i18n.t('wallet_switcher.no_results')}
                      />
                    )}
                  </Box>
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        </MenuContainer>
      </Box>
      <Box
        className={WalletActionsMenu}
        width="full"
        backdropFilter="opacity(5%)"
        padding="20px"
        borderWidth="1px"
        borderColor="separatorTertiary"
        background="surfaceSecondary"
      >
        <Stack space="8px">
          <Link to={ROUTES.ADD_WALLET}>
            <Button
              color="blue"
              variant="flat"
              symbol="plus.circle.fill"
              symbolSide="left"
              height="32px"
              width="full"
              borderRadius="9px"
            >
              {i18n.t('wallet_switcher.add_another_wallet')}
            </Button>
          </Link>
          <Button
            onClick={() => alert('Coming soon!')}
            color="fillSecondary"
            variant="flat"
            symbol="app.connected.to.app.below.fill"
            symbolSide="left"
            height="32px"
            width="full"
            borderRadius="9px"
          >
            {i18n.t('wallet_switcher.connect_hardware_wallet')}
          </Button>
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
        </Stack>
      </Box>
    </Box>
  );
}
