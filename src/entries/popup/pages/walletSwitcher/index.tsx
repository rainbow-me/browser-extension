import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Address } from 'wagmi';

import { useCurrentAddressStore } from '~/core/state';
import { KeychainType } from '~/core/types/keychainTypes';
import { truncateAddress } from '~/core/utils/address';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';

import AccountItem from '../../components/AccountItem/AccountItem';
import { MenuContainer } from '../../components/Menu/MenuContainer';
import { MenuItem } from '../../components/Menu/MenuItem';
import {
  MoreInfoButton,
  MoreInfoOption,
} from '../../components/MoreInfoButton/MoreInfoButton';
import { getWallets } from '../../handlers/wallet';

import { RenameWalletPrompt } from './renameWalletPrompt';

const infoButtonOptions = (
  account: Address,
  setRenameAccount: React.Dispatch<React.SetStateAction<Address | undefined>>,
): MoreInfoOption[] => [
  {
    onSelect: (e: Event) => {
      e.stopPropagation();
      setRenameAccount(account);
    },
    label: 'Rename wallet',
    symbol: 'person.crop.circle.fill',
  },
  {
    onSelect: (e: Event) => {
      e.stopPropagation();
      navigator.clipboard.writeText(account as string);
    },
    label: 'Copy Address',
    subLabel: truncateAddress(account),
    symbol: 'doc.on.doc.fill',
    separator: true,
  },
  {
    onSelect: (e: Event) => {
      e.stopPropagation();
      // console.log('Remove wallet');
    },
    label: 'Remove wallet',
    symbol: 'trash.fill',
    color: 'red',
  },
];

const WatchingPill = () => (
  <Box
    background="surfacePrimaryElevatedSecondary"
    borderRadius="round"
    padding="8px"
  >
    <Text size="12pt" weight="semibold" color="labelQuaternary">
      Watching
    </Text>
  </Box>
);

interface AddressAndType {
  address: Address;
  type: KeychainType;
}

export function WalletSwitcher() {
  const [renameAccount, setRenameAccount] = useState<Address | undefined>();
  const { currentAddress, setCurrentAddress } = useCurrentAddressStore();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<AddressAndType[]>([]);
  useEffect(() => {
    const fetchAccounts = async () => {
      const wallets = await getWallets();
      let accounts: AddressAndType[] = [];
      wallets.forEach((wallet) => {
        accounts = [
          ...accounts,
          ...wallet.accounts.map(
            (account): AddressAndType => ({
              address: account,
              type: wallet.type,
            }),
          ),
        ];
      });
      setAccounts(accounts);
    };
    fetchAccounts();
  }, []);
  const handleSelectAddress = (address: Address) => {
    setCurrentAddress(address);
    navigate(-1);
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
      <Box paddingHorizontal="4px">
        {/* search */}
        <Box />
        <MenuContainer>
          <Box width="full">
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
                        <WatchingPill />
                      )}
                      <MoreInfoButton
                        options={infoButtonOptions(
                          account.address,
                          setRenameAccount,
                        )}
                      />
                    </Inline>
                  }
                  labelComponent={<MenuItem.Label text={'Ξ2.143'} />}
                  isSelected={account.address === currentAddress}
                />
              ))}
            </Stack>
          </Box>
        </MenuContainer>
      </Box>
      <Box
        style={{ position: 'fixed', bottom: 0 }}
        width="full"
        background="surfaceSecondary"
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
                Add another wallet
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
                Connect a hardware wallet
              </Text>
            </Inline>
          </Box>
          <Box></Box>
        </Stack>
      </Box>
    </Box>
  );
}
