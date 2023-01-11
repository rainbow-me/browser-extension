import React, { useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { Box, Stack } from '~/design-system';

import AccountItem from '../../components/AccountItem/AccountItem';
import { MenuContainer } from '../../components/Menu/MenuContainer';
import { getAccounts } from '../../handlers/wallet';

export function WalletSwitcher() {
  const [accounts, setAccounts] = useState<Address[]>();
  useEffect(() => {
    const fetchAccounts = async () => {
      const accounts = await getAccounts();
      setAccounts(accounts);
    };
    fetchAccounts();
  }, []);
  return (
    <Box paddingHorizontal="20px">
      <MenuContainer>
        <Box
          width="full"
          //   paddingVertical={paddingVertical}
        >
          <Stack>
            {accounts?.map((account) => (
              <AccountItem account={account} key={account} />
            ))}
          </Stack>
        </Box>
      </MenuContainer>
    </Box>
  );
}
