import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { KeychainType, KeychainWallet } from '~/core/types/keychainTypes';
import {
  Box,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';

import { AddressOrEns } from '../../components/AddressOrEns/AddressorEns';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import * as wallet from '../../handlers/wallet';

import { CreateWalletPrompt } from './createWalletPrompt';

const GroupAvatar = ({ accounts }: { accounts: Address[] }) => {
  return (
    <Box
      borderRadius="8px"
      style={{
        width: '36px',
        height: '36px',
        backgroundColor: 'rgba(245, 248, 255, 0.06)',
      }}
      padding="5px"
    >
      <Rows space="2px">
        <Row>
          <Columns space="2px">
            <Column>
              {accounts[0] && (
                <WalletAvatar size={12} emojiSize="8pt" address={accounts[0]} />
              )}
            </Column>
            <Column>
              {accounts[1] && (
                <WalletAvatar size={12} emojiSize="8pt" address={accounts[1]} />
              )}
            </Column>
          </Columns>
        </Row>
        <Row>
          <Columns space="2px">
            <Column>
              {accounts[2] && (
                <WalletAvatar size={12} emojiSize="8pt" address={accounts[2]} />
              )}
            </Column>
            <Column>
              {accounts[3] && (
                <WalletAvatar size={12} emojiSize="8pt" address={accounts[3]} />
              )}
            </Column>
          </Columns>
        </Row>
      </Rows>
    </Box>
  );
};

const GroupRow = ({
  leftcomponent,
  centerComponent,
  rightComponent,
  onClick,
}: {
  leftcomponent: ReactElement;
  centerComponent: ReactElement;
  rightComponent: ReactElement;
  onClick: () => void;
}) => {
  return (
    <Box onClick={onClick}>
      <Columns alignHorizontal="justify">
        <Column width="content">
          <Inline space="10px" alignHorizontal="center" alignVertical="center">
            {leftcomponent}
            {centerComponent}
          </Inline>
        </Column>
        <Column width="content">{rightComponent}</Column>
      </Columns>
    </Box>
  );
};

const WalletGroups = ({
  onCreateNewWallet,
  onCreateNewWalletOnGroup,
}: {
  onCreateNewWallet: () => Promise<void>;
  onCreateNewWalletOnGroup: (index: number) => Promise<void>;
}) => {
  const [wallets, setWallets] = useState<KeychainWallet[]>([]);

  useEffect(() => {
    const fetchWallets = async () => {
      const walletsFromKeychain = await wallet.getWallets();
      const controlledWallets = walletsFromKeychain.filter(
        (wallet) => wallet.type !== KeychainType.ReadOnlyKeychain,
      );

      setWallets(controlledWallets);
    };
    fetchWallets();
  }, []);

  return (
    <Stack space="16px">
      <GroupRow
        onClick={onCreateNewWallet}
        leftcomponent={
          <Box
            borderRadius="9px"
            style={{
              width: '30px',
              height: '30px',
              border: '2px dashed rgba(38, 143, 255, 0.2)',
            }}
            alignItems="center"
            justifyContent="center"
            display="flex"
          >
            <Symbol weight="bold" symbol="plus" size={14} color="blue" />
          </Box>
        }
        centerComponent={
          <Stack space="8px">
            <Text size="14pt" color="label" align="left" weight="regular">
              New Wallet Group
            </Text>
            <Text
              size="12pt"
              color="labelTertiary"
              align="left"
              weight="regular"
            >
              Create a new recovery phrase
            </Text>
          </Stack>
        }
        rightComponent={
          <Box
            background={'fillSecondary'}
            padding="4px"
            borderRadius="3px"
            boxShadow="1px"
          >
            <Text size="12pt" color="labelSecondary" weight="semibold">
              {shortcuts.wallets.CHOOSE_WALLET_GROUP_NEW.display}
            </Text>
          </Box>
        }
      />
      <Box>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
      <Stack space="16px">
        {wallets.map((wallet, i) => {
          return (
            <GroupRow
              key={i}
              onClick={() => onCreateNewWalletOnGroup(i)}
              leftcomponent={<GroupAvatar accounts={wallet.accounts} />}
              centerComponent={
                <Stack space="8px">
                  <Text
                    size="14pt"
                    color="label"
                    align="left"
                    weight="semibold"
                  >
                    Wallet Group {i + 1}
                  </Text>
                  <AddressOrEns
                    address={wallet.accounts[0]}
                    size={'12pt'}
                    weight="regular"
                    color="labelTertiary"
                  />
                </Stack>
              }
              rightComponent={
                <Box
                  background={'fillSecondary'}
                  padding="4px"
                  borderRadius="3px"
                  boxShadow="1px"
                >
                  <Text size="12pt" color="labelSecondary" weight="semibold">
                    {i + 1}
                  </Text>
                </Box>
              }
            />
          );
        })}
      </Stack>
    </Stack>
  );
};

const ChooseWalletGroup = () => {
  const [createWalletAddress, setCreateWalletAddress] = useState<Address>();

  const handleCreateWallet = useCallback(async () => {
    console.log('should create a new seed and go through backup flow');
  }, []);

  const handleCreateWalletOnGroup = useCallback(async (index: number) => {
    console.log('should create wallet in group', index);
    // const address = await wallet.create();
    // setCreateWalletAddress(address);
  }, []);

  const onClose = () => {
    setCreateWalletAddress(undefined);
  };

  return (
    <Box height="full">
      <CreateWalletPrompt
        show={!!createWalletAddress}
        onClose={onClose}
        address={createWalletAddress}
      />
      <Box paddingHorizontal="20px" height="full">
        <Stack space="24px">
          <Box paddingHorizontal="28px">
            <Stack space="8px">
              <Text size="16pt" color="label" align="center" weight="bold">
                {i18n.t('choose_wallet_group.title')}
              </Text>
              <Text
                size="12pt"
                color="labelTertiary"
                align="center"
                weight="regular"
              >
                {i18n.t('choose_wallet_group.description')}
              </Text>
            </Stack>
          </Box>
          <Box style={{ width: '106px' }}>
            <Separator color="separatorTertiary" strokeWeight="1px" />
          </Box>
          <Box
            width="full"
            style={{
              overflow: 'auto',
              height: '420px',
            }}
          >
            <Box
              background="surfaceSecondaryElevated"
              borderRadius="28px"
              boxShadow="12px surfaceSecondaryElevated"
              padding="20px"
            >
              <WalletGroups
                onCreateNewWallet={handleCreateWallet}
                onCreateNewWalletOnGroup={handleCreateWalletOnGroup}
              />
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export { ChooseWalletGroup };
