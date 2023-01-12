import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Address } from 'wagmi';

import { useCurrentAddressStore } from '~/core/state';
import { truncateAddress } from '~/core/utils/address';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';

import AccountItem from '../../components/AccountItem/AccountItem';
import { MenuContainer } from '../../components/Menu/MenuContainer';
import { MenuItem } from '../../components/Menu/MenuItem';
import {
  MoreInfoButton,
  MoreInfoOption,
} from '../../components/MoreInfoButton/MoreInfoButton';
import { getAccounts } from '../../handlers/wallet';

const infoButtonOptions = (account: Address): MoreInfoOption[] => [
  {
    onSelect: (e: Event) => {
      e.stopPropagation();
      console.log('rename wallet');
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
    symbol: 'trash',
    color: 'red',
  },
];

export function WalletSwitcher() {
  const { setCurrentAddress } = useCurrentAddressStore();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Address[]>();
  useEffect(() => {
    const fetchAccounts = async () => {
      const accounts = await getAccounts();
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
      <Box paddingHorizontal="4px">
        {/* search */}
        <Box />
        <MenuContainer>
          <Box width="full">
            <Stack>
              {accounts?.map((account) => (
                <AccountItem
                  onClick={() => {
                    console.log('clicked on larger item');
                    handleSelectAddress(account);
                  }}
                  account={account}
                  key={account}
                  rightComponent={
                    <MoreInfoButton options={infoButtonOptions(account)} />
                  }
                  labelComponent={<MenuItem.Label text={'Ξ2.143'} />}
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
