import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useHiddenWalletsStore } from '~/core/state/hiddenWallets';
import { KeychainType } from '~/core/types/keychainTypes';
import { truncateAddress } from '~/core/utils/address';
import { Box, Button, Inline, Stack, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { Symbol, SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { TextStyles } from '~/design-system/styles/core.css';

import AccountItem, {
  LabelOption,
} from '../../components/AccountItem/AccountItem';
import { LabelPill } from '../../components/LabelPill/LabelPill';
import { MenuContainer } from '../../components/Menu/MenuContainer';
import {
  MoreInfoButton,
  MoreInfoOption,
} from '../../components/MoreInfoButton/MoreInfoButton';
import { remove } from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useWallets } from '../../hooks/useWallets';
import { ROUTES } from '../../urls';

import { WalletActionsMenu } from './WalletSwitcher.css';
import { RemoveWalletPrompt } from './removeWalletPrompt';
import { RenameWalletPrompt } from './renameWalletPrompt';

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

const bottomSpacing = 20 + 20 + 32 + 32 + (process.env.IS_DEV ? 32 + 8 : 0);

const NoWallets = () => (
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
      <Symbol
        symbol="binoculars.fill"
        weight="bold"
        size={32}
        color="labelQuaternary"
      />
      <Text size="20pt" weight="bold" color="labelQuaternary">
        {i18n.t('wallet_switcher.no_wallets')}
      </Text>
    </Stack>
  </Box>
);

export interface AddressAndType {
  address: Address;
  type: KeychainType;
}

export function WalletSwitcher() {
  const [renameAccount, setRenameAccount] = useState<Address | undefined>();
  const [removeAccount, setRemoveAccount] = useState<
    AddressAndType | undefined
  >();
  const { currentAddress, setCurrentAddress } = useCurrentAddressStore();
  const { hideWallet } = useHiddenWalletsStore();
  const [q, setQ] = useState('');
  const navigate = useRainbowNavigate();
  const { visibleWallets: accounts, fetchWallets } = useWallets();
  const handleSelectAddress = (address: Address) => {
    setCurrentAddress(address);
    navigate(ROUTES.HOME);
  };
  const handleRemoveAccount = async (address: Address) => {
    const removed = accounts.find((account) => account.address === address);
    // remove if read-only
    if (removed?.type === KeychainType.ReadOnlyKeychain) {
      await remove(address);
      fetchWallets();
    } else {
      // hide if imported
      hideWallet({ address });
    }
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
  };

  const displayedWallets = accounts.map((account) => (
    <AccountItem
      key={account.address}
      onClick={() => {
        handleSelectAddress(account.address);
      }}
      account={account.address}
      rightComponent={
        <Inline alignVertical="center" space="10px">
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
      searchTerm={q}
    />
  ));

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

      <Box paddingHorizontal="4px">
        <Box paddingHorizontal="16px" paddingBottom="20px" marginTop="-5px">
          <Input
            height="32px"
            variant="bordered"
            placeholder={i18n.t('wallet_switcher.search_placeholder')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Box>
        <MenuContainer>
          <Box
            width="full"
            height="full"
            style={{ paddingBottom: bottomSpacing }}
          >
            <Stack>{displayedWallets}</Stack>
            {displayedWallets.length === 0 && <NoWallets />}
          </Box>
        </MenuContainer>
      </Box>
      <Box
        className={WalletActionsMenu}
        width="full"
        backdropFilter="blur(26px)"
        padding="20px"
        borderWidth="1px"
        borderColor="separatorTertiary"
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
          {process.env.IS_DEV && (
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
