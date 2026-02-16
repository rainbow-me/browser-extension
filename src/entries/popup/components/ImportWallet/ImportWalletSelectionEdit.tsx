import { useMemo, useReducer, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Address } from 'viem';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { lessThan } from '~/core/utils/numbers';
import { Box, Button, Stack, Text } from '~/design-system';

import { Spinner } from '../../components/Spinner/Spinner';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import {
  WalletSummary,
  useWalletsSummary,
} from '../../hooks/useWalletsSummary';
import { ROUTES } from '../../urls';
import { getInputIsFocused } from '../../utils/activeElement';

import { AccountToImportRows } from './AccountToImportRows';
import { ImportWalletNavbar } from './ImportWalletNavbar';
import { useImportWalletsFromSecrets } from './ImportWalletSelection';
import { useImportWalletSessionSecrets } from './useImportWalletSessionSecrets';

export type WalletsSortMethod =
  | 'default'
  | 'token-balance'
  | 'last-transaction';

const sortAccounts = (
  sortBy: WalletsSortMethod,
  accounts: Address[],
  summaries: Record<Address, WalletSummary>,
) => {
  switch (sortBy) {
    case 'token-balance': {
      const accountsInfo = Object.values(summaries);
      const sortedAccounts = accountsInfo.sort((a, b) =>
        lessThan(b.balance.amount, a.balance.amount)
          ? -1
          : lessThan(a.balance.amount, b.balance.amount)
          ? 1
          : 0,
      );
      return sortedAccounts.map((account) => account.address);
    }
    case 'last-transaction': {
      const accountsInfo = Object.values(summaries);
      const sortedAccounts = accountsInfo.sort(
        (a, b) => (b.lastTx || 0) - (a.lastTx || 0),
      );
      return sortedAccounts.map((account) => account.address);
    }
    case 'default':
    default:
      return accounts;
  }
};

const addOrRemoveAddy = (addresses: Address[], address: Address) => {
  if (addresses.includes(address))
    return addresses.filter((a) => a !== address);
  return [address, ...addresses];
};

const emptyArray: unknown[] = [];
export function ImportWalletSelectionEdit({ onboarding = false }) {
  const navigate = useRainbowNavigate();
  const setCurrentAddress = useCurrentAddressStore(
    (state) => state.setCurrentAddress,
  );

  const { state } = useLocation();
  const accountsToImport: Address[] = state.accountsToImport || emptyArray;

  const secrets = useImportWalletSessionSecrets();

  const { isLoading: walletsSummaryisAddingWallets, walletsSummary } =
    useWalletsSummary({ addresses: accountsToImport });

  const [accountsIgnored, toggleAccount] = useReducer(addOrRemoveAddy, []);
  const amountOfAddressesBeingAdded =
    accountsToImport.length - accountsIgnored.length;
  const isButtonDisabled = amountOfAddressesBeingAdded === 0;

  const [sortMethod, setSortMethod] = useState<WalletsSortMethod>('default');
  const sortedAccountsToImport = useMemo(
    () => sortAccounts(sortMethod, accountsToImport, walletsSummary),
    [sortMethod, accountsToImport, walletsSummary],
  );

  const { importSecrets, isImporting } = useImportWalletsFromSecrets();

  const onImport = () =>
    importSecrets({ secrets, accountsIgnored }).then(() => {
      const importedAccounts = sortedAccountsToImport.filter(
        (a) => !accountsIgnored.includes(a),
      );
      setCurrentAddress(importedAccounts[0]);
      if (onboarding) {
        navigate(ROUTES.CREATE_PASSWORD, {
          state: {
            backTo: ROUTES.IMPORT__SEED + '?onboarding=true',
          },
        });
      } else navigate(ROUTES.HOME);
    });

  return (
    <>
      <ImportWalletNavbar
        navbarIcon="arrow"
        showSortMenu={!isImporting}
        sortMethod={sortMethod}
        setSortMethod={setSortMethod}
        title={i18n.t('edit_import_wallet_selection.title')}
      />
      <Box
        height="full"
        paddingHorizontal="16px"
        background="surfaceSecondary"
        display="flex"
        flexDirection="column"
        alignItems="center"
        width="full"
      >
        {isImporting || walletsSummaryisAddingWallets ? (
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
                {i18n.t('edit_import_wallet_selection.importing_your_wallet', {
                  count: amountOfAddressesBeingAdded,
                })}
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
              style={{
                overflow: 'scroll',
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
                <AccountToImportRows
                  accountsIgnored={accountsIgnored}
                  accountsToImport={sortedAccountsToImport}
                  toggleAccount={toggleAccount}
                  walletsSummary={walletsSummary}
                  showCheckbox
                  navigableWithKeyboard
                />
              </Box>
            </Box>

            <Box width="full" paddingTop="16px">
              <Button
                symbol="arrow.uturn.down.circle.fill"
                symbolSide="left"
                color={isButtonDisabled ? 'labelQuaternary' : 'accent'}
                height="44px"
                variant={isButtonDisabled ? 'disabled' : 'raised'}
                width="full"
                disabled={isButtonDisabled}
                onClick={onImport}
                tabIndex={0}
                shortcut={{
                  ...shortcuts.global.SELECT,
                  disabled: () => isButtonDisabled || getInputIsFocused(),
                  hideHint: true,
                }}
              >
                {i18n.t('edit_import_wallet_selection.add_wallet', {
                  count: amountOfAddressesBeingAdded,
                })}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </>
  );
}
