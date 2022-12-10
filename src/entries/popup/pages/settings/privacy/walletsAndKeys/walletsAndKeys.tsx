import React from 'react';
import { useNavigate } from 'react-router-dom';

import { DummyAccount } from '~/core/types/walletsAndKeys';
import { Box, Symbol } from '~/design-system';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

import testAccounts from './testAccounts.json'; // temporary account data for UI -- will revisit to hook up with actual wallets

interface DummyAccounts {
  [accountId: string]: DummyAccount;
}
export function WalletsAndKeys() {
  const navigate = useNavigate();

  const testData = testAccounts as DummyAccounts;

  const handleViewAccount = (accountId: string) => {
    navigate(`/settings/privacy/walletsAndKeys/accountDetails`, {
      state: { account: testData[accountId] },
    });
  };

  return (
    <Box>
      <Box paddingHorizontal="20px">
        <MenuContainer>
          {Object.keys(testData).map((accountId) => {
            const account = testData[accountId];
            const numberOfWallets = account.wallets.length;
            const singleWallet = numberOfWallets === 1;
            const label = `${account.imported ? 'Imported ‧ ' : ''}${
              account.wallets.length
            } Wallet${singleWallet ? '' : 's'}`;

            return (
              <Menu key={accountId}>
                <MenuItem
                  titleComponent={<MenuItem.Title text={accountId} />}
                  labelComponent={<MenuItem.Label text={label} />}
                  onClick={() => handleViewAccount(accountId)}
                  leftComponent={
                    <Symbol
                      symbol={
                        singleWallet
                          ? 'lock.square.fill'
                          : 'lock.square.stack.fill'
                      }
                      weight="medium"
                      size={18}
                      color="labelTertiary"
                    />
                  }
                  hasRightArrow
                />
                <MenuItem.WalletList wallets={account.wallets} />
              </Menu>
            );
          })}
          <Menu>
            <MenuItem
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
                  text="New Secret Phrase & Wallet"
                  color="blue"
                />
              }
            />
          </Menu>
        </MenuContainer>
      </Box>
    </Box>
  );
}
