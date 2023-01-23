import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { KeychainWallet } from '~/core/types/keychainTypes';
import { truncateAddress } from '~/core/utils/address';
import { Box, Inline, Row, Rows, Symbol, Text } from '~/design-system';
import { Avatar } from '~/entries/popup/components/Avatar/Avatar';
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
import { getWallet } from '~/entries/popup/handlers/wallet';
import { useAvatar } from '~/entries/popup/hooks/useAvatar';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useWalletName } from '~/entries/popup/hooks/useWalletName';
import { ROUTES } from '~/entries/popup/urls';

import { NewWalletPrompt } from './newWalletPrompt';

const MoreInfoButton = ({ account }: { account: Address }) => {
  const navigate = useRainbowNavigate();
  const { state } = useLocation();
  const handleViewPrivateKey = () => {
    navigate(
      ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__PKEY_WARNING,
      { state: { account, password: state.password } },
    );
  };
  const handleCopyAddress = useCallback(() => {
    navigator.clipboard.writeText(account);
  }, [account]);

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
                {i18n.t(
                  'settings.privacy_and_security.wallets_and_keys.wallet_details.view_private_key',
                )}
              </Text>
            </Box>
          </Inline>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={handleCopyAddress}>
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
                  {i18n.t(
                    'settings.privacy_and_security.wallets_and_keys.wallet_details.copy_address',
                  )}
                </Text>
              </Row>
              <Row>
                <Text size="11pt" weight="medium" color="labelTertiary">
                  {truncateAddress(account)}
                </Text>
              </Row>
            </Rows>
          </Inline>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function AccountItem({ account }: { account: Address }) {
  const { avatar, isFetched } = useAvatar({ address: account });

  const { displayName, showAddress } = useWalletName({ address: account });
  return (
    <MenuItem
      key={account}
      titleComponent={<MenuItem.Title text={displayName} />}
      labelComponent={
        showAddress ? <MenuItem.Label text={truncateAddress(account)} /> : null
      }
      leftComponent={
        <Box marginRight="-8px">
          <Avatar.Wrapper size={36}>
            {isFetched ? (
              <>
                {avatar?.imageUrl ? (
                  <Avatar.Image imageUrl={avatar.imageUrl} />
                ) : (
                  <Avatar.Emoji
                    color={avatar?.color}
                    emoji={avatar?.emoji}
                    size="20pt"
                  />
                )}
              </>
            ) : null}
            <Avatar.Skeleton />
          </Avatar.Wrapper>
        </Box>
      }
      rightComponent={<MoreInfoButton account={account} />}
    />
  );
}

export function WalletDetails() {
  const navigate = useRainbowNavigate();
  const { state } = useLocation();
  const [showNewWalletPrompt, setShowNewWalletPrompt] = useState(false);
  const [wallet, setWallet] = useState<KeychainWallet>(state.wallet);
  const handleOpenNewWalletPrompt = () => {
    setShowNewWalletPrompt(true);
  };
  const handleCloseNewWalletPrompt = () => {
    setShowNewWalletPrompt(false);
  };
  const handleViewRecoveryPhrase = () => {
    navigate(
      ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_WARNING,
      { state: { wallet, password: state.password } },
    );
  };

  useEffect(() => {
    const fetchWallet = async () => {
      const fetchedWallet = await getWallet(state.wallet?.accounts[0]);
      setWallet(fetchedWallet);
    };
    fetchWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <NewWalletPrompt
        wallet={wallet}
        show={showNewWalletPrompt}
        onClose={handleCloseNewWalletPrompt}
      />
      <Box paddingHorizontal="20px">
        <MenuContainer testId="settings-menu-container">
          <Menu>
            <MenuItem
              titleComponent={
                <MenuItem.Title
                  text={i18n.t(
                    'settings.privacy_and_security.wallets_and_keys.wallet_details.view_recovery_phrase',
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
              onClick={handleViewRecoveryPhrase}
            />
          </Menu>
          <Menu paddingVertical="8px">
            {wallet?.accounts.map((account: Address) => {
              return <AccountItem account={account} key={account} />;
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
                    'settings.privacy_and_security.wallets_and_keys.wallet_details.create_new_wallet',
                  )}
                  color="blue"
                />
              }
              onClick={handleOpenNewWalletPrompt}
            />
          </Menu>
        </MenuContainer>
      </Box>
    </Box>
  );
}
