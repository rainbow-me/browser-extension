import { xor } from 'lodash';
import React, { useMemo, useReducer } from 'react';
import { useLocation } from 'react-router-dom';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { minus } from '~/core/utils/numbers';
import { Box, Button, Stack, Text } from '~/design-system';

import { Spinner } from '../../components/Spinner/Spinner';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useWalletsSummary } from '../../hooks/useWalletsSummary';
import { WalletsSortMethod } from '../../pages/importWalletSelection/EditImportWalletSelection';
import { ROUTES } from '../../urls';

import { AccountToImportRows } from './AccountToImportRows';
import { useImportWalletsFromSecrets } from './ImportWalletSelection';

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
  const { setCurrentAddress } = useCurrentAddressStore();

  const { state } = useLocation();
  const accountsToImport: Address[] = state.accountsToImport || [];

  const { isLoading: walletsSummaryisAddingWallets, walletsSummary } =
    useWalletsSummary({ addresses: accountsToImport });

  const [accountsIgnored, toggleAccount] = useReducer(
    (s: Address[], a: Address) => xor(s, [a]),
    [],
  );
  const amountOfAddressesBeingAdded =
    accountsToImport.length - accountsIgnored.length;

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

  const { importSecrets, isImporting } = useImportWalletsFromSecrets({
    onSuccess(addresses) {
      setCurrentAddress(addresses[0]);
      if (onboarding) navigate(ROUTES.CREATE_PASSWORD);
      navigate(ROUTES.HOME);
    },
  });

  const importSelectedWallets = async () => {
    importSecrets({ secrets, ignoreAddresses: accountsIgnored });
  };

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
      <Box width="full" paddingTop="16px">
        <Button
          symbol="arrow.uturn.down.circle.fill"
          symbolSide="left"
          color={'accent'}
          height="44px"
          variant="raised"
          width="full"
          disabled={isImporting}
          // onClick={() => importSecrets()}
        >
          {i18n.t('edit_import_wallet_selection.add_wallet', {
            count: amountOfAddressesBeingAdded,
          })}
        </Button>
      </Box>
    </Box>
  );
}
