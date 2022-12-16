import { fetchEnsName } from '@wagmi/core';
import { useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { contactsStore, useContactsStore } from '~/core/state/contacts';
import { KeychainType } from '~/core/types/keychainTypes';

import { useBackgroundAccounts } from '../useBackgroundAccounts';
import { useBackgroundWallets } from '../useBackgroundWallets';

interface WalletData {
  ensName?: string;
  address: Address;
  name?: string;
}

const getAddressData = async ({
  address,
}: {
  address: Address;
}): Promise<WalletData> => {
  const ensName = (await fetchEnsName({ address })) as string;
  const { getContact } = contactsStore.getState();
  const contact = getContact({ address });
  return {
    ensName,
    address,
    name: contact?.name,
  };
};

const getAddressesData = async ({ addresses }: { addresses: Address[] }) => {
  const addressesData = await Promise.all(
    addresses.map(async (address) => await getAddressData({ address })),
  );
  return addressesData;
};

const filterWalletData = ({
  ensName,
  address,
  name,
  filter,
}: {
  ensName?: string;
  address: Address;
  name?: string;
  filter: string;
}) =>
  ensName?.toLowerCase()?.startsWith(filter?.toLowerCase()) ||
  address?.toLowerCase()?.startsWith(filter?.toLowerCase()) ||
  name?.toLowerCase()?.startsWith(filter?.toLowerCase());

export const useAllFilteredWallets = ({ filter }: { filter: string }) => {
  const { accounts } = useBackgroundAccounts();
  const { wallets } = useBackgroundWallets();
  const { contacts: contactsObjects } = useContactsStore();

  const [filteredWallets, setFilteredWallets] = useState<Address[]>([]);
  const [filteredWatchedWallets, setFilteredWatchedWallets] = useState<
    Address[]
  >([]);
  const [filteredContactsWallets, setFilteredContactsWallets] = useState<
    Address[]
  >([]);

  const [walletsData, setWalletsData] = useState<WalletData[]>([]);
  const [watchedWalletsData, setWatchedWalletsData] = useState<WalletData[]>(
    [],
  );
  const [contactsData, setContactsData] = useState<WalletData[]>([]);

  const watchedWallets = wallets.filter(
    (wallet) => wallet.type === KeychainType.ReadOnlyKeychain,
  );
  const watchedAccounts = watchedWallets
    .map((watchedWallet) => watchedWallet.accounts)
    .flat();
  const contacts = Object.keys(contactsObjects) as Address[];

  useEffect(() => {
    const getWalletsData = async () => {
      const walletsData = await getAddressesData({ addresses: accounts });
      const watchedWalletsData = await getAddressesData({
        addresses: watchedAccounts,
      });
      const contactsData = await getAddressesData({ addresses: contacts });
      setWalletsData(walletsData);
      setWatchedWalletsData(watchedWalletsData);
      setContactsData(contactsData);
    };
    getWalletsData();
  }, [accounts, contacts, watchedAccounts]);

  useEffect(() => {
    const filterWallets = async () => {
      const filteredWalletsData = walletsData.filter(
        ({ ensName, address, name }) =>
          filterWalletData({ ensName, address, name, filter }),
      );
      const filteredWatchedWalletsData = watchedWalletsData.filter(
        ({ ensName, address, name }) =>
          filterWalletData({ ensName, address, name, filter }),
      );
      const filteredContactsData = contactsData.filter(
        ({ ensName, address, name }) =>
          filterWalletData({ ensName, address, name, filter }),
      );

      const filteredWallets = filteredWalletsData.map(({ address }) => address);
      const filteredWatchedWallets = filteredWatchedWalletsData.map(
        ({ address }) => address,
      );
      const filteredContactsWallets = filteredContactsData.map(
        ({ address }) => address,
      );
      setFilteredWallets(filteredWallets);
      setFilteredWatchedWallets(filteredWatchedWallets);
      setFilteredContactsWallets(filteredContactsWallets);
    };
    filterWallets();
  }, [
    accounts,
    contacts,
    contactsData,
    filter,
    walletsData,
    watchedAccounts,
    watchedWalletsData,
  ]);

  return {
    wallets: filteredWallets,
    watchedWallets: filteredWatchedWallets,
    contacts: filteredContactsWallets,
  };
};
