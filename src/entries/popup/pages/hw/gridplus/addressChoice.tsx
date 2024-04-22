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
    queryKey: ['gridplusAddressess', useGridPlusClientStore.getState().client],
    queryFn: async () => {
      if (process.env.IS_TESTING === 'true') {
        return HARDWARE_WALLETS.MOCK_ACCOUNT.accountsToImport.map(
          (account) => account.address,
        );
      }

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
  });

export const AddressChoice = () => {
  const { state } = useLocation();

  const { data: addresses } = useGridPlusAddresses();

  if (!addresses || addresses.length === 0) return <Spinner size={24} />;

  const accountsToImport = addresses.map((address, i) => ({
    address,
    index: i,
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
      }}
    />
  );
};
