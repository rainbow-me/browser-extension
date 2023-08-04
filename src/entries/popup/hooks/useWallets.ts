import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { Address, useAccount } from 'wagmi';

import { analytics } from '~/analytics';
import { useHiddenWalletsStore } from '~/core/state/hiddenWallets';
import { KeychainType } from '~/core/types/keychainTypes';

import { getStatus, getWallets } from '../handlers/wallet';

export interface AddressAndType {
  address: Address;
  type: KeychainType;
  vendor: string | undefined;
}

const fetchWallets = async () => {
  const wallets = await getWallets();
  return wallets.reduce(
    (accounts, wallet) => [
      ...accounts,
      ...wallet.accounts.map((address) => ({
        address,
        type: wallet.type,
        vendor: wallet.vendor,
      })),
    ],
    [] as AddressAndType[],
  );
};

const trackWalletTypes = async () => {
  const { unlocked, ready } = await getStatus();
  if (!unlocked || !ready) return;

  const wallets = await getWallets();

  const ownedAccounts = wallets
    .filter(
      (a) =>
        a.type === KeychainType.HdKeychain ||
        a.type === KeychainType.KeyPairKeychain,
    )
    .reduce((count, wallet) => count + wallet.accounts.length, 0);

  const watchedAccounts = wallets
    .filter((a) => a.type === KeychainType.ReadOnlyKeychain)
    .reduce((count, wallet) => count + wallet.accounts.length, 0);

  const recoveryPhrases = wallets.filter(
    (a) => a.type === KeychainType.HdKeychain,
  ).length;

  const importedRecoveryPhrases = wallets.filter(
    (a) => a.type === KeychainType.HdKeychain && !a.imported,
  ).length;

  const privateKeys = wallets.filter(
    (a) => a.type === KeychainType.KeyPairKeychain,
  ).length;

  const importedPrivateKeys = wallets.filter(
    (a) => a.type === KeychainType.KeyPairKeychain && !a.imported,
  ).length;

  const hasImported = importedPrivateKeys > 0 || importedRecoveryPhrases > 0;

  const hardwareWallets = wallets.filter(
    (a) => a.type === KeychainType.HardwareWalletKeychain,
  );

  const hardwareAccounts = hardwareWallets.reduce(
    (count, wallet) => count + wallet.accounts.length,
    0,
  );

  const ledgerDevices = wallets.filter((a) => a.vendor === 'Ledger').length;

  const trezorDevices = wallets.filter((a) => a.vendor === 'Trezor').length;

  analytics.identify({
    ownedAccounts,
    hardwareAccounts,
    watchedAccounts,
    recoveryPhrases,
    importedRecoveryPhrases,
    privateKeys,
    importedPrivateKeys,
    ledgerDevices,
    trezorDevices,
    hasImported,
  });
};

export const useWallets = () => {
  const { hiddenWallets } = useHiddenWalletsStore();

  const { data: allWallets, refetch } = useQuery(['accounts'], fetchWallets, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { address } = useAccount();

  useEffect(() => {
    trackWalletTypes();
  }, [allWallets]);

  return useMemo(() => {
    if (!allWallets)
      return {
        allWallets: [],
        visibleWallets: [],
        visibleOwnedWallets: [],
        watchedWallets: [],
        walletsReady: false,
        isWatchingWallet: false,
        fetchWallets: refetch,
      };

    const visibleWallets = allWallets.filter((a) => !hiddenWallets[a.address]);
    const visibleOwnedWallets = visibleWallets.filter(
      (a) => a.type !== KeychainType.ReadOnlyKeychain,
    );
    const watchedWallets = visibleWallets.filter(
      (a) => a.type === KeychainType.ReadOnlyKeychain,
    );
    const watchedAddresses = watchedWallets.map(({ address }) => address);
    return {
      allWallets,
      visibleWallets,
      visibleOwnedWallets,
      watchedWallets,
      walletsReady: true,
      isWatchingWallet: address && watchedAddresses.includes(address),
      fetchWallets: refetch,
    };
  }, [allWallets, hiddenWallets, address, refetch]);
};
