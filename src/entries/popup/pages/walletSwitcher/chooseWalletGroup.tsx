import React, { useCallback, useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { KeychainType, KeychainWallet } from '~/core/types/keychainTypes';
import {
  Box,
  Button,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { add, create, getWallets } from '~/entries/popup/handlers/wallet';

import { AddressOrEns } from '../../components/AddressOrEns/AddressorEns';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

import { CreateWalletPrompt } from './createWalletPrompt';

const WalletGroups = ({
  onCreateNewWallet,
  onCreateNewWalletOnGroup,
  wallets,
}: {
  onCreateNewWallet: () => Promise<void>;
  onCreateNewWalletOnGroup: (index: number) => Promise<void>;
  wallets: KeychainWallet[];
}) => {
  return (
    <Box padding="20px">
      <Button
        color={'label'}
        variant={'transparent'}
        width="full"
        height="44px"
        onClick={onCreateNewWallet}
      >
        <Inline space={'10px'}>
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
          <Box display="flex" alignItems="flex-end">
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
          </Box>
        </Inline>
      </Button>
      <Box padding="16px">
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
      <Stack space="16px">
        {wallets.map((wallet, i) => {
          return (
            <Button
              color={'label'}
              variant={'transparent'}
              width="full"
              height="44px"
              onClick={() => onCreateNewWalletOnGroup(i)}
              key={`wallet_group_${i}`}
            >
              <Inline space={'10px'}>
                <Box
                  borderRadius="9px"
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: 'rgba(245, 248, 255, 0.06)',
                  }}
                  alignItems="center"
                  justifyContent="center"
                  display="flex"
                ></Box>
                <Stack space="8px">
                  <Text size="14pt" color="label" align="left" weight="regular">
                    Wallet Group {i + 1}
                  </Text>
                  <Text
                    size="12pt"
                    color="labelTertiary"
                    align="left"
                    weight="regular"
                  >
                    <AddressOrEns
                      address={wallet.accounts[0]}
                      size={'12pt'}
                      weight="regular"
                    ></AddressOrEns>
                  </Text>
                </Stack>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                >
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
                </Box>
              </Inline>
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
};

const ChooseWalletGroup = () => {
  const navigate = useRainbowNavigate();
  const [wallets, setWallets] = useState<KeychainWallet[]>([]);

  useEffect(() => {
    const fetchWallets = async () => {
      const walletsFromKeychain = await getWallets();
      const controlledWallets = walletsFromKeychain.filter(
        (wallet) => wallet.type !== KeychainType.ReadOnlyKeychain,
      );

      setWallets(controlledWallets);

      const sessionData = await chrome.storage.session.get('walletToAdd');
      if (sessionData.walletToAdd) {
        setCreateWalletAddress(sessionData.walletToAdd);
        chrome.storage.session.remove('walletToAdd');
      }
    };
    fetchWallets();
  }, []);

  const [createWalletAddress, setCreateWalletAddress] = useState<Address>();

  const handleCreateWallet = useCallback(async () => {
    const newWalletAccount = await create();
    const wallet = {
      accounts: [newWalletAccount],
      imported: false,
      type: KeychainType.HdKeychain,
    };
    navigate(
      ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_WARNING,
      {
        state: {
          wallet,
          showQuiz: true,
          fromChooseGroup: true,
        },
      },
    );
  }, [navigate]);

  const handleCreateWalletOnGroup = useCallback(
    async (index: number) => {
      const wallet = wallets[index];
      const silbing = wallet.accounts[0];
      const address = await add(silbing);
      setCreateWalletAddress(address);
    },
    [wallets],
  );

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
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        paddingHorizontal="20px"
        paddingBottom="20px"
        height="full"
      >
        <Box paddingHorizontal="28px" paddingBottom="44px">
          <Text
            size="12pt"
            color="labelTertiary"
            align="center"
            weight="regular"
          >
            {i18n.t('choose_wallet_group.description')}
          </Text>
        </Box>
        <Box width="full" background="surfaceSecondary">
          <Box
            background="surfaceSecondaryElevated"
            borderRadius="16px"
            padding="12px"
            paddingTop={'16px'}
            paddingBottom="10px"
            boxShadow="12px surfaceSecondaryElevated"
          >
            <WalletGroups
              onCreateNewWallet={handleCreateWallet}
              onCreateNewWalletOnGroup={handleCreateWalletOnGroup}
              wallets={wallets}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export { ChooseWalletGroup };
