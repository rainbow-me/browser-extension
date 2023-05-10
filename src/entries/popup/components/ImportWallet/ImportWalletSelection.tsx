/* eslint-disable no-await-in-loop */
/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { Box, Button, Inline, Rows, Separator, Text } from '~/design-system';

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
  const { state } = useLocation();
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
      for (const secret of state.secrets) {
        const derivedAddresses = await deriveAccountsFromSecret(secret);
        addresses = [...addresses, ...derivedAddresses];
      }
      setAccountsToImport(addresses);
    };
    init();
  }, [state?.secrets]);

  const handleAddWallets = useCallback(async () => {
    if (isImporting) return;
    setIsImporting(true);
    // Import all the secrets
    for (let i = 0; i < state.secrets.length; i++) {
      const address = (await wallet.importWithSecret(
        state.secrets[i],
      )) as Address;
      // Select the first wallet
      if (i === 0) {
        setCurrentAddress(address);
      }
    }
    onboarding ? navigate(ROUTES.CREATE_PASSWORD) : navigate(ROUTES.HOME);
  }, [isImporting, navigate, onboarding, setCurrentAddress, state.secrets]);

  const handleEditWallets = useCallback(async () => {
    onboarding
      ? navigate(ROUTES.IMPORT__EDIT, {
          state: {
            secrets: state.secrets,
            accountsToImport,
          },
        })
      : navigate(ROUTES.NEW_IMPORT_WALLET_SELECTION_EDIT, {
          state: {
            secrets: state.secrets,
            accountsToImport,
          },
        });
  }, [accountsToImport, navigate, onboarding, state.secrets]);

  return (
    <>
      <Box alignItems="center" paddingBottom="10px">
        <Inline alignVertical="center" alignHorizontal="center">
          <Text size="16pt" weight="bold" color="label" align="center">
            {i18n.t('import_wallet_selection.title')}
          </Text>
        </Inline>
        <Box padding="16px" paddingTop="10px">
          <Text
            size="12pt"
            weight="regular"
            color="labelTertiary"
            align="center"
          >
            {accountsToImport.length && !isImporting
              ? accountsToImport.length === 1
                ? i18n.t('import_wallet_selection.description_singular')
                : i18n.t('import_wallet_selection.description_plural', {
                    count: accountsToImport.length,
                  })
              : ''}
          </Text>
        </Box>
      </Box>
      <Box width="full" style={{ width: '106px' }} paddingBottom="28px">
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
      {!accountsToImport.length || isImporting || walletsSummaryIsLoading ? (
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
            {isImporting
              ? i18n.t('import_wallet_selection.importing')
              : i18n.t('import_wallet_selection.loading')}
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
        <>
          <Box
            width="full"
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
                testId="add-wallets-button"
              >
                {i18n.t('import_wallet_selection.add_wallets')}
              </Button>
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
            </Rows>
          </Box>
        </>
      )}
    </>
  );
};

export { ImportWalletSelection };
