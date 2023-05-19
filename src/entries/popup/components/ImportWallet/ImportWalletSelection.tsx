import {
  UseMutationOptions,
  useMutation,
  useQueries,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
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

import * as wallet from '../../handlers/wallet';
import { deriveAccountsFromSecret } from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useWalletsSummary } from '../../hooks/useWalletsSummary';
import { ROUTES } from '../../urls';
import { Spinner } from '../Spinner/Spinner';

import { AccountToImportRows } from './AccountToImportRows';

const useDeriveAccountsFromSecrets = (secrets: string[]) => {
  const accountsFromSecrets = useQueries({
    queries: secrets.map((s) => ({
      queryKey: ['accounts from secret', s], // no persisterVersion so secrets are not persisted to storage, only in memory cache
      queryFn: () => deriveAccountsFromSecret(s),
    })),
  });
  return useMemo(
    () =>
      accountsFromSecrets.reduce(
        (all, { data = [] }) => [...all, ...data],
        [] as Address[],
      ),
    [accountsFromSecrets],
  );
};

const useImportSecrets = (options: UseMutationOptions<Address[]>) => {
  const { mutate, isLoading } = useMutation(
    ['import secrets'],
    (secrets: string[]) => Promise.all(secrets.map(wallet.importWithSecret)),
    // options,
  );
  return { importSecrets: mutate, isImporting: isLoading };
};

export const ImportWalletSelection = ({ onboarding = false }) => {
  const navigate = useRainbowNavigate();
  const { state }: { state: { secrets?: string[] } } = useLocation();
  const { setCurrentAddress } = useCurrentAddressStore();

  const secrets = state.secrets || [];

  const accountsToImport = useDeriveAccountsFromSecrets(secrets);
  const { importSecrets, isImporting } = useImportSecrets({});
  // , {
  //   onSuccess(addresses) {
  //     setCurrentAddress(addresses[0]);
  //     if (onboarding) navigate(ROUTES.CREATE_PASSWORD);
  //     else navigate(ROUTES.HOME);
  //   },
  // });

  const { isLoading: walletsSummaryIsLoading, walletsSummary } =
    useWalletsSummary({
      addresses: accountsToImport,
    });

  const handleEditWallets = () => {
    navigate(
      onboarding
        ? ROUTES.IMPORT__EDIT
        : ROUTES.NEW_IMPORT_WALLET_SELECTION_EDIT,
      { state: { secrets: state.secrets, accountsToImport } },
    );
  };

  const isReady =
    accountsToImport.length && !isImporting && !walletsSummaryIsLoading;

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
            <Box paddingHorizontal="28px">
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

            <Box width="full" paddingVertical="20px">
              <Rows alignVertical="top" space="8px">
                <Button
                  symbol="arrow.uturn.down.circle.fill"
                  symbolSide="left"
                  color={'accent'}
                  height="44px"
                  variant={'flat'}
                  width="full"
                  onClick={() => importSecrets(secrets)}
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
      </Row>
    </Rows>
  );
};
