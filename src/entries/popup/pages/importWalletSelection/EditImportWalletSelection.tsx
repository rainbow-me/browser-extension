/* eslint-disable no-await-in-loop */
/* eslint-disable no-nested-ternary */
import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import {
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Separator,
  Text,
} from '~/design-system';

import { AddressOrEns } from '../../components/AddressOrEns/AddressorEns';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { Spinner } from '../../components/Spinner/Spinner';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import * as wallet from '../../handlers/wallet';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../urls';

export function EditImportWalletSelection() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [accountsIgnored, setAccountsIgnored] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { setCurrentAddress } = useCurrentAddressStore();
  const { updateStatus } = useAuth();

  const selectedAccounts = useMemo(
    () => state.accountsToImport.length - accountsIgnored.length,
    [accountsIgnored, state.accountsToImport.length],
  );

  const handleAddWallets = useCallback(async () => {
    if (isLoading) return;
    if (selectedAccounts === 0) return;
    setIsLoading(true);
    let defaultAccountChosen = false;
    // Import all the secrets
    for (let i = 0; i < state.secrets.length; i++) {
      const address = (await wallet.importWithSecret(
        state.secrets[i],
      )) as Address;
      // Select the first wallet
      if (!defaultAccountChosen && !accountsIgnored.includes(address)) {
        defaultAccountChosen = true;
        setCurrentAddress(address);
      }
    }

    // Exclude address that were not selected
    for (let i = 0; i < accountsIgnored.length; i++) {
      await wallet.remove(accountsIgnored[i] as Address);
    }

    await updateStatus();
    navigate(ROUTES.CREATE_PASSWORD);
  }, [
    accountsIgnored,
    isLoading,
    navigate,
    selectedAccounts,
    updateStatus,
    setCurrentAddress,
    state.secrets,
  ]);

  const toggleAccount = useCallback(
    (address: Address) => {
      if (isLoading) return;
      if (accountsIgnored.includes(address)) {
        setAccountsIgnored(accountsIgnored.filter((a) => a !== address));
      } else {
        setAccountsIgnored([...accountsIgnored, address]);
      }
    },
    [accountsIgnored, isLoading],
  );

  return (
    <FullScreenContainer>
      <Box alignItems="center" paddingBottom="10px" width="full">
        {isLoading ? (
          <Box
            alignItems="center"
            justifyContent="center"
            width="full"
            paddingTop="80px"
          >
            <Text
              size="14pt"
              weight="regular"
              color="labelSecondary"
              align="center"
            >
              {selectedAccounts === 1
                ? i18n.t('edit_import_wallet_selection.importing_your_wallet')
                : i18n.t('edit_import_wallet_selection.importing_your_wallets')}
            </Text>
            <br />
            <br />
            <br />
            <Box
              width="fit"
              alignItems="center"
              justifyContent="center"
              style={{ margin: 'auto' }}
            >
              <Spinner size={32} />
            </Box>
          </Box>
        ) : (
          <Box
            width="full"
            style={{
              overflow: 'auto',
              height: '454px',
            }}
          >
            <Box
              background="surfaceSecondaryElevated"
              borderRadius="16px"
              padding="16px"
              borderColor={'separatorSecondary'}
              borderWidth={'1px'}
              width="full"
              position="relative"
            >
              <Rows space="14px">
                {state.accountsToImport.map(
                  (address: Address, index: number) => (
                    <Row key={`avatar_${address}`}>
                      <Rows>
                        <Row>
                          <Columns>
                            <Column>
                              <Box onClick={() => toggleAccount(address)}>
                                <Inline
                                  space="8px"
                                  alignHorizontal="left"
                                  alignVertical="center"
                                >
                                  <WalletAvatar
                                    address={address as Address}
                                    size={32}
                                    emojiSize={'16pt'}
                                  />
                                  <Box justifyContent="flex-start" width="fit">
                                    <AddressOrEns
                                      size="14pt"
                                      weight="bold"
                                      color="label"
                                      address={address as Address}
                                    />
                                  </Box>
                                </Inline>
                              </Box>
                            </Column>
                            <Column width="content">
                              <Box
                                alignItems="center"
                                justifyContent="flex-end"
                                width="fit"
                                onClick={() => toggleAccount(address)}
                              >
                                <Checkbox
                                  selected={!accountsIgnored.includes(address)}
                                />
                              </Box>
                            </Column>
                          </Columns>
                        </Row>
                        <Row>
                          <Box width="full" paddingTop="6px">
                            {index !== state.accountsToImport.length - 1 ? (
                              <Separator
                                color="separatorTertiary"
                                strokeWeight="1px"
                              />
                            ) : null}
                          </Box>
                        </Row>
                      </Rows>
                    </Row>
                  ),
                )}
              </Rows>
            </Box>
          </Box>
        )}
        {!isLoading && (
          <Box width="full" paddingTop="20px">
            <Rows alignVertical="top" space="8px">
              <Button
                symbol="arrow.uturn.down.circle.fill"
                symbolSide="left"
                color={'accent'}
                height="44px"
                variant={'flat'}
                width="full"
                onClick={handleAddWallets}
              >
                {selectedAccounts > 1
                  ? i18n.t('edit_import_wallet_selection.add_n_wallets', {
                      count: selectedAccounts,
                    })
                  : i18n.t('edit_import_wallet_selection.add_wallet')}
              </Button>
            </Rows>
          </Box>
        )}
      </Box>
    </FullScreenContainer>
  );
}
