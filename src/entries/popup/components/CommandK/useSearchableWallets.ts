import { useCallback, useMemo } from 'react';
import { Address } from 'viem';

import { useCurrentAddressStore } from '~/core/state';
import { truncateAddress } from '~/core/utils/address';

import { useAccounts } from '../../hooks/useAccounts';

import { SearchItemType, WalletSearchItem } from './SearchItems';
import { CommandKPage, PAGES } from './pageConfig';
import { actionLabels } from './references';

const generateWalletShortcut = (walletIndex: number) => {
  if (walletIndex >= 0 && walletIndex < 9) {
    const walletShortcut = walletIndex + 1;
    return {
      display: walletShortcut.toString(),
      key: walletShortcut.toString(),
    };
  }
  return undefined;
};

export const truncateName = (name?: string | null) => {
  if (name) {
    return name.length > 25 ? `${name.slice(0, 25)}…` : name;
  } else return undefined;
};

export const useSearchableWallets = (currentPage: CommandKPage) => {
  const { sortedAccounts } = useAccounts(({ sortedAccounts }) => ({
    sortedAccounts,
  }));
  const setCurrentAddress = useCurrentAddressStore.use.setCurrentAddress();

  const handleSelectAddress = useCallback(
    (address: Address) => {
      setCurrentAddress(address);
    },
    [setCurrentAddress],
  );

  const searchableWallets = useMemo(() => {
    return sortedAccounts.map<WalletSearchItem>((account, index) => ({
      action: () => handleSelectAddress(account.address),
      actionLabel: actionLabels.switchToWallet,
      actionPage: PAGES.WALLET_DETAIL,
      address: account.address,
      ensName: account.ensName,
      hardwareWalletType: account.vendor,
      id: account.address,
      name:
        account.walletName ||
        account.ensName ||
        truncateAddress(account.address),
      page: PAGES.MY_WALLETS,
      shortcut:
        currentPage === PAGES.HOME ? undefined : generateWalletShortcut(index),
      truncatedName: truncateName(account.walletName || account.ensName),
      type: SearchItemType.Wallet,
      walletName: account.walletName,
      walletType: account.type,
    }));
  }, [currentPage, handleSelectAddress, sortedAccounts]);

  return { searchableWallets };
};
