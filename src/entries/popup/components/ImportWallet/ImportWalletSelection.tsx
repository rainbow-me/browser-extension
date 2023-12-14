import { Address } from '@wagmi/core';
import { useEffect, useMemo, useState } from 'react';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { SessionStorage } from '~/core/storage';
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

import { removeImportWalletSecrets } from '../../handlers/importWalletSecrets';
import * as wallet from '../../handlers/wallet';
import { deriveAccountsFromSecret } from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useWalletsSummary } from '../../hooks/useWalletsSummary';
import { ROUTES } from '../../urls';
import { Spinner } from '../Spinner/Spinner';

import { AccountToImportRows } from './AccountToImportRows';
import { useImportWalletSessionSecrets } from './useImportWalletSessionSecrets';

const derivedAccountsStore = {
  get: () =>
    SessionStorage.get('derivedAccountsFromSecrets').then(
      (derivedAccountsFromSecrets) => derivedAccountsFromSecrets || {},
    ) as Promise<Record<string, Address[]>>,
  set: async (derivedAccountsFromSecrets: Record<string, Address[]>) =>
    SessionStorage.set(
      'derivedAccountsFromSecrets',
      derivedAccountsFromSecrets,
    ),
  clear: () => SessionStorage.set('derivedAccountsFromSecrets', {}),
};

const derivedAccountsFromSecret = async (secret: string) => {
  const current = await derivedAccountsStore.get();
  if (current[secret]) return current[secret];

  const accounts = await deriveAccountsFromSecret(secret);
  derivedAccountsStore.set({ ...current, [secret]: accounts });

  return accounts || ([] as Address[]);
};

const useDeriveAccountsFromSecrets = (secrets: string[]) => {
  const [accounts, setAccounts] = useState<Address[]>([]);

  useEffect(() => {
    let mounted = true;
    if (!secrets.length) return;
    derivedAccountsFromSecret(secrets.join(' ')).then((results) => {
      if (!mounted) return;
      setAccounts(results);
    });

    return () => {
      mounted = false;
    };
  }, [secrets]);

  return accounts;
};

export const useImportWalletsFromSecrets = () => {
  const [isImporting, setIsImporting] = useState(false);

  const importSecrets = async ({
    secrets,
    accountsIgnored = [],
  }: {
    secrets: string[];
    accountsIgnored?: Address[];
  }) => {
    setIsImporting(true);
    return (async () => {
      const prevAccounts = await wallet.getAccounts();
      await wallet.importWithSecret(secrets.join(' '));

      if (!accountsIgnored.length) return wallet.getAccounts();

      // when importing another account from a seed that was already imported earlier
      // don't remove accounts that where already in the keychain before importing these secrets
      const accountsToRemove = accountsIgnored.filter(
        (address) => !prevAccounts.includes(address),
      );

      await Promise.all(accountsToRemove.map(wallet.remove));

      return wallet.getAccounts();
    })().finally(() => {
      setIsImporting(false);
      derivedAccountsStore.clear();
      removeImportWalletSecrets();
    });
  };

  return { importSecrets, isImporting };
};

export const ImportWalletSelection = ({ onboarding = false }) => {
  const navigate = useRainbowNavigate();
  const { setCurrentAddress } = useCurrentAddressStore();

  const secrets = useImportWalletSessionSecrets();

  const accountsToImport = useDeriveAccountsFromSecrets(secrets);
  const { importSecrets, isImporting } = useImportWalletsFromSecrets();

  const { isLoading: walletsSummaryIsLoading, walletsSummary } =
    useWalletsSummary({
      addresses: accountsToImport,
    });

  const handleEditWallets = () => {
    navigate(
      onboarding
        ? ROUTES.IMPORT__EDIT
        : ROUTES.NEW_IMPORT_WALLET_SELECTION_EDIT,
      { state: { accountsToImport } },
    );
  };

  const onImport = () =>
    importSecrets({ secrets }).then(() => {
      setCurrentAddress(accountsToImport[0]);
      if (onboarding) navigate(ROUTES.CREATE_PASSWORD);
      else navigate(ROUTES.HOME);
    });

  const isReady =
    !!accountsToImport?.length && !isImporting && !walletsSummaryIsLoading;

  const hasRecentlyUsedWallet = useMemo(
    () =>
      Object.values(walletsSummary).some(
        ({ lastTx, balance }) => !!lastTx && balance.amount !== '0',
      ),
    [walletsSummary],
  );

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
            {isReady && (
              <Box paddingHorizontal="28px">
                <Text
                  size="12pt"
                  weight="regular"
                  color="labelTertiary"
                  align="center"
                >
                  {i18n.t(
                    // eslint-disable-next-line no-nested-ternary
                    hasRecentlyUsedWallet
                      ? accountsToImport.length > 1
                        ? 'import_wallet_selection.description.other'
                        : 'import_wallet_selection.description.one'
                      : 'import_wallet_selection.description.zero',
                    (hasRecentlyUsedWallet &&
                      accountsToImport.length > 0 && {
                        count: hasRecentlyUsedWallet
                          ? accountsToImport.length
                          : 0,
                      }) ||
                      undefined,
                  )}
                </Text>
              </Box>
            )}
          </Stack>

          {isReady && (
            <Box width="full" style={{ width: '106px' }}>
              <Separator color="separatorTertiary" strokeWeight="1px" />
            </Box>
          )}
        </Stack>
      </Row>

      <Row>
        {!isReady ? (
          <Box
            alignItems="center"
            justifyContent="center"
            width="full"
            paddingTop="80px"
            testId="add-wallets-not-ready"
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
              style={{ overflow: 'auto', height: '292px' }}
            >
              <Box
                background="surfaceSecondaryElevated"
                borderRadius="16px"
                paddingHorizontal="12px"
                paddingTop={accountsToImport.length > 1 ? '16px' : '10px'}
                paddingBottom="10px"
                boxShadow="12px surfaceSecondaryElevated"
              >
                <AccountToImportRows
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
                <Button
                  symbol="arrow.uturn.down.circle.fill"
                  symbolSide="left"
                  color={'accent'}
                  height="44px"
                  variant="raised"
                  width="full"
                  onClick={onImport}
                  testId="add-wallets-button"
                  tabIndex={0}
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
                  tabIndex={0}
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
