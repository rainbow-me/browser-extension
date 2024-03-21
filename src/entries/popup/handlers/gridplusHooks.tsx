import { connect, setup } from 'gridplus-sdk';
import * as React from 'react';
import { Address } from 'wagmi';

import { useCurrentAddressStore } from '~/core/state';
import { useGridPlusClientStore } from '~/core/state/gridplusClient';
import { useHiddenWalletsStore } from '~/core/state/hiddenWallets';
import { useWalletBackupsStore } from '~/core/state/walletBackups';
import { useWalletNamesStore } from '~/core/state/walletNames';
import { LocalStorage } from '~/core/storage';

import { useAccounts } from '../hooks/useAccounts';
import { useRainbowNavigate } from '../hooks/useRainbowNavigate';
import { ROUTES } from '../urls';

import {
  getStoredGridPlusClient,
  removeStoredGridPlusClient,
  setStoredGridPlusClient,
} from './gridplus';
import { remove, wipe } from './wallet';

export const useGridPlusInit = () => {
  const setClient = useGridPlusClientStore((state) => state.setClient);
  const setStoredClient = (storedClient: string | null) => {
    if (!storedClient) return;
    setStoredGridPlusClient(storedClient);
    setClient(storedClient);
  };
  React.useEffect(() => {
    setup({
      getStoredClient: () => useGridPlusClientStore.getState().client,
      setStoredClient: setStoredClient,
      name: 'Rainbow',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

// Handle removed permissions for Rainbow from Lattice1.
// If there are GridPlus addresses -> Remove them from Rainbow and switch to another existing address.
// If there are only GridPlus addresses -> Start over.
export const useGridPlusPermissions = () => {
  const navigate = useRainbowNavigate();
  const { sortedAccounts } = useAccounts();
  const { unhideWallet } = useHiddenWalletsStore();
  const { deleteWalletName } = useWalletNamesStore();
  const { deleteWalletBackup } = useWalletBackupsStore();
  const { setCurrentAddress } = useCurrentAddressStore();

  const handleRemoveAccount = async (address: Address) => {
    unhideWallet({ address });
    await remove(address);
    deleteWalletName({ address });
    deleteWalletBackup({ address });
  };

  const checkPermissions = async () => {
    if (sortedAccounts.length === 0) return;
    if (await getStoredGridPlusClient()) {
      const deviceId = (await LocalStorage.get('gridPlusDeviceId')) ?? '';
      connect(deviceId).then((permitted) => {
        const accountsWithGridPlus = sortedAccounts.filter(
          (account) => account.vendor === 'GridPlus',
        );
        const nonGridPlusAccounts = sortedAccounts.filter(
          (account) => account.vendor !== 'GridPlus',
        );
        if (!permitted && accountsWithGridPlus.length > 0) {
          accountsWithGridPlus.forEach((gridPlusAccount) => {
            handleRemoveAccount(gridPlusAccount.address);
          });
          removeStoredGridPlusClient();
          if (nonGridPlusAccounts.length > 0) {
            setCurrentAddress(nonGridPlusAccounts[0].address);
            navigate(ROUTES.HOME);
          } else {
            wipe();
            navigate(ROUTES.WELCOME);
          }
        }
      });
    }
  };

  React.useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedAccounts.length]);
};
