/* eslint-disable no-await-in-loop */
import React, { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { minus } from '~/core/utils/numbers';
import { Box, Button, Stack, Text } from '~/design-system';

import { Spinner } from '../../components/Spinner/Spinner';
import {
  getImportWalletSecrets,
  removeImportWalletSecrets,
} from '../../handlers/importWalletSecrets';
import * as wallet from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useWalletsSummary } from '../../hooks/useWalletsSummary';
import { WalletsSortMethod } from '../../pages/importWalletSelection/EditImportWalletSelection';
import { ROUTES } from '../../urls';

import { AccountToImportRows } from './AccountToImportRows';

export function ImportWalletSelectionEdit({
  isAddingWallets,
  onboarding = false,
  sortMethod,
  setIsAddingWallets,
}: {
  isAddingWallets: boolean;
  onboarding?: boolean;
  sortMethod?: WalletsSortMethod;
  setIsAddingWallets: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const navigate = useRainbowNavigate();
  const { state } = useLocation();
  const [accountsIgnored, setAccountsIgnored] = useState<Address[]>([]);
  const { setCurrentAddress } = useCurrentAddressStore();
  const { isLoading: walletsSummaryisAddingWallets, walletsSummary } =
    useWalletsSummary({
      addresses: state.accountsToImport,
    });

  const sortedAccountsToImport = useMemo(() => {
    switch (sortMethod) {
      case 'token-balance': {
        const accountsInfo = Object.values(walletsSummary);
        const sortedAccounts = accountsInfo.sort((a, b) =>
          Number(minus(b.balance.amount, a.balance.amount)),
        );
        return sortedAccounts.map((account) => account.address);
      }
      case 'last-transaction': {
        const accountsInfo = Object.values(walletsSummary);
        const sortedAccounts = accountsInfo.sort((a, b) =>
          Number(minus(b.lastTx || 0, a.lastTx || 0)),
        );
        return sortedAccounts.map((account) => account.address);
      }
      case 'default':
      default:
        return state.accountsToImport;
    }
  }, [sortMethod, state.accountsToImport, walletsSummary]);

  const selectedAccounts = useMemo(
    () => state.accountsToImport.length - accountsIgnored.length,
    [accountsIgnored, state.accountsToImport.length],
  );

  const handleAddWallets = useCallback(async () => {
    if (isAddingWallets) return;
    if (selectedAccounts === 0) return;
    setIsAddingWallets(true);
    let defaultAccountChosen = false;
    // Import all the secrets
    const secrets = await getImportWalletSecrets();
    for (let i = 0; i < secrets.length; i++) {
      const address = (await wallet.importWithSecret(secrets[i])) as Address;
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

    setIsAddingWallets(false);
    removeImportWalletSecrets();
    onboarding
      ? navigate(ROUTES.CREATE_PASSWORD, { state: { backTo: ROUTES.WELCOME } })
      : navigate(ROUTES.HOME);
  }, [
    isAddingWallets,
    selectedAccounts,
    setIsAddingWallets,
    onboarding,
    navigate,
    accountsIgnored,
    setCurrentAddress,
  ]);

  const toggleAccount = useCallback(
    (address: Address) => {
      if (isAddingWallets) return;
      if (accountsIgnored.includes(address)) {
        setAccountsIgnored(accountsIgnored.filter((a) => a !== address));
      } else {
        setAccountsIgnored([...accountsIgnored, address]);
      }
    },
    [accountsIgnored, isAddingWallets],
  );

  return (
    <Box alignItems="center" width="full">
      {isAddingWallets || walletsSummaryisAddingWallets ? (
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
              {selectedAccounts === 1
                ? i18n.t('edit_import_wallet_selection.importing_your_wallet')
                : i18n.t('edit_import_wallet_selection.importing_your_wallets')}
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
            height="full"
          >
            <AccountToImportRows
              accountsIgnored={accountsIgnored}
              accountsToImport={sortedAccountsToImport}
              toggleAccount={toggleAccount}
              walletsSummary={walletsSummary}
              showCheckbox
            />
          </Box>
        </Box>
      )}
      {!isAddingWallets && (
        <Box width="full" paddingTop="16px">
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
        </Box>
      )}
    </Box>
  );
}
