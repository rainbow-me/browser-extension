import React, { useCallback, useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { KeychainType, KeychainWallet } from '~/core/types/keychainTypes';
import { Box, Inline, Separator, Stack, Symbol, Text } from '~/design-system';

import { AddressOrEns } from '../../components/AddressOrEns/AddressorEns';
import * as wallet from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';

import { CreateWalletPrompt } from './createWalletPrompt';

const WalletGroups = () => {
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
    <Box padding="20px">
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
          <Text size="12pt" color="labelTertiary" align="left" weight="regular">
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
      <Box padding="16px">
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
      <Stack space="16px">
        {wallets.map((wallet, i) => {
          return (
            <Inline space={'10px'} key={`wallet_group_${i}`}>
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
              <Box display="flex" alignItems="center" justifyContent="flex-end">
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
          );
        })}
      </Stack>
    </Box>
  );
};

const ChooseWalletGroup = () => {
  const navigate = useRainbowNavigate();

  const [createWalletAddress, setCreateWalletAddress] = useState<Address>();

  const handleCreateWallet = useCallback(async () => {
    const address = await wallet.create();
    setCreateWalletAddress(address);
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
        <Box
          width="full"
          background="surfaceSecondary"
          style={{
            overflow: 'auto',
            height: '291px',
          }}
        >
          <Box
            background="surfaceSecondaryElevated"
            borderRadius="16px"
            padding="12px"
            paddingTop={'16px'}
            paddingBottom="10px"
            boxShadow="12px surfaceSecondaryElevated"
          >
            <WalletGroups />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export { ChooseWalletGroup };
