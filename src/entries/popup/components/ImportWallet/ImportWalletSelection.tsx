/* eslint-disable no-await-in-loop */
/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import {
  Box,
  Button,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Text,
} from '~/design-system';

import {
  getImportWalletSecrets,
  removeImportWalletSecrets,
} from '../../handlers/importWalletSecrets';
import { deriveAccountsFromSecret } from '../../handlers/wallet';
import * as wallet from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useWalletsSummary } from '../../hooks/useWalletsSummary';
import { ROUTES } from '../../urls';
import { Spinner } from '../Spinner/Spinner';

import { AccountToImportRows } from './AccountToImportRows';

const ImportWalletSelection = ({
  onboarding = false,
}: {
  onboarding?: boolean;
}) => {
  const navigate = useRainbowNavigate();
  const [isImporting, setIsImporting] = useState(false);
  const { setCurrentAddress } = useCurrentAddressStore();
  const [accountsToImport, setAccountsToImport] = useState<Address[]>([]);

  const { isLoading: walletsSummaryIsLoading, walletsSummary } =
    useWalletsSummary({
      addresses: accountsToImport,
    });

  useEffect(() => {
    const init = async () => {
      let addresses: Address[] = [];
      const secrets = await getImportWalletSecrets();
      for (const secret of secrets) {
        const derivedAddresses = await deriveAccountsFromSecret(secret);
        addresses = [...addresses, ...derivedAddresses];
      }
      setAccountsToImport(addresses);
    };
    init();
  }, []);

  const handleAddWallets = useCallback(async () => {
    if (isImporting) return;
    setIsImporting(true);
    // Import all the secrets
    const secrets = await getImportWalletSecrets();
    for (let i = 0; i < secrets.length; i++) {
      const address = (await wallet.importWithSecret(secrets[i])) as Address;
      // Select the first wallet
      if (i === 0) {
        setCurrentAddress(address);
      }
    }
    setIsImporting(false);
    removeImportWalletSecrets();
    onboarding
      ? navigate(ROUTES.CREATE_PASSWORD, { state: { backTo: ROUTES.WELCOME } })
      : navigate(ROUTES.HOME);
  }, [isImporting, navigate, onboarding, setCurrentAddress]);

  const handleEditWallets = useCallback(async () => {
    onboarding
      ? navigate(ROUTES.IMPORT__EDIT, {
          state: {
            accountsToImport,
          },
        })
      : navigate(ROUTES.NEW_IMPORT_WALLET_SELECTION_EDIT, {
          state: {
            accountsToImport,
          },
        });
  }, [accountsToImport, navigate, onboarding]);

  const isReady =
    accountsToImport.length && !isImporting && !walletsSummaryIsLoading;

  console.log('-- isReady accountsToImport', accountsToImport);
  console.log('-- isReady isImporting', isImporting);
  console.log('-- isReady walletsSummaryIsLoading', walletsSummaryIsLoading);
  return (
    <Rows space="20px" alignVertical="justify">
      <Row height="content">
        <Stack space="20px" alignHorizontal="center">
          <Stack space="12px">
            <Inline alignVertical="center" alignHorizontal="center">
              <Text size="16pt" weight="bold" color="label" align="center">
                {i18n.t('import_wallet_selection.title')}
              </Text>
            </Inline>
            {isReady ? (
              <Box paddingHorizontal="28px">
                <Text
                  size="12pt"
                  weight="regular"
                  color="labelTertiary"
                  align="center"
                >
                  {accountsToImport.length === 1
                    ? i18n.t('import_wallet_selection.description_singular')
                    : i18n.t('import_wallet_selection.description_plural', {
                        count: accountsToImport.length,
                      })}
                </Text>
              </Box>
            ) : null}
          </Stack>
          {isReady ? (
            <Box width="full" style={{ width: '106px' }}>
              <Separator color="separatorTertiary" strokeWeight="1px" />
            </Box>
          ) : null}
        </Stack>
      </Row>

      <Row>
        {!isReady ? (
          <Box
            alignItems="center"
            justifyContent="center"
            width="full"
            paddingTop="80px"
          >
            <Stack space="20px">
              <Text
                size="14pt"
                weight="regular"
                color="labelSecondary"
                align="center"
              >
                {isImporting
                  ? i18n.t('import_wallet_selection.importing')
                  : i18n.t('import_wallet_selection.loading')}
              </Text>
              <Box
                width="fit"
                alignItems="center"
                justifyContent="center"
                style={{ margin: 'auto' }}
              >
                <Spinner size={32} />
              </Box>
            </Stack>
          </Box>
        ) : (
          <>
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
                paddingTop={accountsToImport.length > 1 ? '16px' : '10px'}
                paddingBottom="10px"
                boxShadow="12px surfaceSecondaryElevated"
              >
                <AccountToImportRows
                  accountsIgnored={[]}
                  accountsToImport={accountsToImport}
                  walletsSummary={walletsSummary}
                />
              </Box>
            </Box>

            <Box
              testId="add-wallets-button-section"
              width="full"
              paddingVertical="20px"
            >
              <Rows alignVertical="top" space="8px">
                <Row>
                  <Button
                    symbol="arrow.uturn.down.circle.fill"
                    symbolSide="left"
                    color={'accent'}
                    height="44px"
                    variant={'flat'}
                    width="full"
                    onClick={handleAddWallets}
                    testId="add-wallets-button"
                  >
                    {i18n.t('import_wallet_selection.add_wallets')}
                  </Button>
                </Row>
                <Row>
                  <Button
                    color="labelSecondary"
                    height="44px"
                    variant="transparent"
                    width="full"
                    onClick={handleEditWallets}
                    testId="edit-wallets-button"
                  >
                    {i18n.t('import_wallet_selection.edit_wallets')}
                  </Button>
                </Row>
              </Rows>
            </Box>
          </>
        )}
      </Row>
    </Rows>
  );
};

export { ImportWalletSelection };
