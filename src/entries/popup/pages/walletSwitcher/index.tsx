import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useHiddenWalletsStore } from '~/core/state/hiddenWallets';
import { KeychainType } from '~/core/types/keychainTypes';
import { truncateAddress } from '~/core/utils/address';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
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
        {/* search */}
        <Box />
        <MenuContainer>
          <Box width="full" paddingBottom="80px">
            <Stack>
              {accounts?.map((account) => (
                <AccountItem
                  onClick={() => {
                    handleSelectAddress(account.address);
                  }}
                  account={account.address}
                  key={account.address}
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
                />
              ))}
            </Stack>
          </Box>
        </MenuContainer>
      </Box>
      <Box
        className={WalletActionsMenu}
        width="full"
        backdropFilter="blur(26px)"
        padding="10px"
        borderWidth="1px"
        borderColor="separatorTertiary"
      >
        <Stack>
          <Box padding="10px">
            <Inline alignVertical="center" space="10px">
              <Symbol
                symbol="plus.circle.fill"
                weight={'bold'}
                size={16}
                color="blue"
              />
              <Text size="14pt" weight="medium" color="blue">
                {i18n.t('wallet_switcher.add_another_wallet')}
              </Text>
            </Inline>
          </Box>
          <Box padding="10px">
            <Inline alignVertical="center" space="10px">
              <Symbol
                symbol="app.connected.to.app.below.fill"
                weight={'bold'}
                size={16}
                color="blue"
              />
              <Text size="14pt" weight="medium" color="blue">
                {i18n.t('wallet_switcher.connect_hardware_wallet')}
              </Text>
            </Inline>
          </Box>
          {process.env.IS_DEV && (
            <Box padding="10px">
              <Link to={ROUTES.WALLETS}>
                <Inline alignVertical="center" space="10px">
                  <Symbol
                    symbol="gear"
                    weight={'bold'}
                    size={16}
                    color="labelSecondary"
                  />
                  <Text size="14pt" weight="medium" color="labelSecondary">
                    Old Wallets UI [DEV]
                  </Text>
                </Inline>
              </Link>
            </Box>
          )}
          <Box></Box>
        </Stack>
      </Box>
    </Box>
  );
}
