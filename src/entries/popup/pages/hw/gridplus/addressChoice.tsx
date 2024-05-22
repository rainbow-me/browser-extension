import { useQuery } from '@tanstack/react-query';
import gridplus from 'gridplus-sdk';
import { Navigate, useLocation } from 'react-router-dom';

import { getWallets } from '~/core/keychain';
import { useGridPlusClientStore } from '~/core/state/gridplusClient';
import { KeychainType } from '~/core/types/keychainTypes';
import { Spinner } from '~/entries/popup/components/Spinner/Spinner';
import { HARDWARE_WALLETS } from '~/entries/popup/handlers/walletVariables';
import { ROUTES } from '~/entries/popup/urls';

const useGridPlusAddresses = () =>
  useQuery({
    queryKey: ['gridplusAddresses', useGridPlusClientStore.getState().client],
    queryFn: async () => {
      if (process.env.IS_TESTING === 'true') {
        return HARDWARE_WALLETS.MOCK_ACCOUNT.accountsToImport.map(
          (account) => account.address,
        );
      }

      /*
        the code below could be removed when we merge 
        https://github.com/rainbow-me/browser-extension/pull/1435
        as the keychain itself will handle it
      */

      const currentWallets = getWallets();

      const gridplusAddresses = await gridplus.fetchAddresses();

      const alreadyAddedOwnedAccounts = (await currentWallets)
        .filter((a) => a.type !== KeychainType.ReadOnlyKeychain)
        .flatMap((a) => a.accounts);

      // ignore addresses already in the extension
      return gridplusAddresses.filter(
        (address) => !alreadyAddedOwnedAccounts.includes(address),
      );
    },
    staleTime: 0,
    cacheTime: 0,
  });

export const AddressChoice = () => {
  const { state } = useLocation();

  const { data: addresses, isFetching } = useGridPlusAddresses();

  if (isFetching || !addresses || addresses.length === 0)
    return <Spinner size={24} />;

  const accountsToImport = addresses.map((address) => ({
    address,
    index: -1, // GridPlus doesn't support add by index, gonna keep it with a negative value to avoid refactoring the whole flow
  }));

  return (
    <Navigate
      to={ROUTES.HW_WALLET_LIST}
      state={{
        accountsToImport,
        deviceId: 'GridPlus',
        accountsEnabled: accountsToImport.length,
        vendor: 'GridPlus',
        direction: state?.direction,
        navbarIcon: state?.navbarIcon,
        supportsAddByIndex: false,
      }}
    />
  );
};
