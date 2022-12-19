import React from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { DummyWallet } from '~/core/types/walletsAndKeys';
import { truncateAddress } from '~/core/utils/address';
import { Box, Inline, Row, Rows, Symbol, Text } from '~/design-system';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

const MoreInfoButton = ({ wallet }: { wallet: DummyWallet }) => {
  const handleViewPrivateKey = () => {
    null;
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Box style={{ cursor: 'default' }}>
          <Symbol
            symbol="ellipsis.circle"
            weight="bold"
            size={14}
            color="labelTertiary"
          />
        </Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={handleViewPrivateKey}>
          <Inline alignVertical="center" space="8px" wrap={false}>
            <Symbol
              size={18}
              symbol="key.fill"
              weight="semibold"
              color="labelQuaternary"
            />
            <Box width="full">
              <Text size="14pt" weight="semibold">
                View Private Key
              </Text>
            </Box>
          </Inline>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Inline alignVertical="center" space="8px" wrap={false}>
            <Symbol
              symbol="doc.on.doc"
              size={18}
              weight="semibold"
              color="labelQuaternary"
            />
            <Rows space="6px">
              <Row>
                <Text size="14pt" weight="semibold">
                  Copy Address
                </Text>
              </Row>
              <Row>
                <Text size="11pt" weight="medium" color="labelTertiary">
                  {truncateAddress(wallet.address)}
                </Text>
              </Row>
            </Rows>
          </Inline>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function AccountDetails() {
  const { state } = useLocation();

  return (
    <Box>
      <Box paddingHorizontal="20px">
        <MenuContainer testId="settings-menu-container">
          <Menu>
            <MenuItem
              titleComponent={
                <MenuItem.Title
                  text={i18n.t(
                    'settings.privacy_and_security.wallets_and_keys.account_details.view_recovery_phrase',
                  )}
                />
              }
              leftComponent={
                <Symbol
                  symbol="lock.square.fill"
                  weight="medium"
                  size={18}
                  color="labelTertiary"
                />
              }
              hasRightArrow
            />
          </Menu>
          <Menu>
            {state?.account.wallets.map((wallet: DummyWallet) => {
              return (
                <MenuItem
                  key={wallet.address}
                  titleComponent={
                    <MenuItem.Title
                      text={wallet.ens || truncateAddress(wallet.address)}
                    />
                  }
                  labelComponent={
                    wallet.ens ? (
                      <MenuItem.Label text={truncateAddress(wallet.address)} />
                    ) : null
                  }
                  rightComponent={<MoreInfoButton wallet={wallet} />}
                />
              );
            })}
          </Menu>
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
                  text={i18n.t(
                    'settings.privacy_and_security.wallets_and_keys.account_details.create_new_wallet',
                  )}
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
