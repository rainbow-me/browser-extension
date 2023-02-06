import { fetchEnsName } from '@wagmi/core';
import { isAddress } from 'ethers/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { contactsStore, useContactsStore } from '~/core/state/contacts';
import { isENSAddressFormat } from '~/core/utils/ethereum';

import { useWallets } from '../useWallets';

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
  const { contacts: contactsObjects } = useContactsStore();
  const { visibleOwnedWallets, watchedWallets } = useWallets();

  const contacts = useMemo(
    () => Object.keys(contactsObjects) as Address[],
    [contactsObjects],
  );

  const [filteredWallets, setFilteredWallets] = useState<Address[]>(
    visibleOwnedWallets.map((wallet) => wallet.address),
  );
  const [filteredWatchedWallets, setFilteredWatchedWallets] = useState<
    Address[]
  >(watchedWallets.map((wallet) => wallet.address));
  const [filteredContactsWallets, setFilteredContactsWallets] =
    useState<Address[]>(contacts);

  const [walletsData, setWalletsData] = useState<WalletData[]>([]);
  const [watchedWalletsData, setWatchedWalletsData] = useState<WalletData[]>(
    [],
  );
  const [contactsData, setContactsData] = useState<WalletData[]>([]);

  useEffect(() => {
    const getWalletsData = async () => {
      const walletsData = await getAddressesData({
        addresses: visibleOwnedWallets.map((wallet) => wallet.address),
      });
      const watchedWalletsData = await getAddressesData({
        addresses: watchedWallets.map((wallet) => wallet.address),
      });
      const contactsData = await getAddressesData({ addresses: contacts });
      setWalletsData(walletsData);
      setWatchedWalletsData(watchedWalletsData);
      setContactsData(contactsData);
    };
    getWalletsData();
  }, [contacts, contactsObjects, visibleOwnedWallets, watchedWallets]);

  useEffect(() => {
    const filterWallets = async () => {
      const filterIsAddressOrEns =
        isAddress(filter) || isENSAddressFormat(filter);

      const [
        filteredWalletsData,
        filteredWatchedWalletsData,
        filteredContactsData,
      ] = [walletsData, watchedWalletsData, contactsData].map((data) =>
        data.filter(
          ({ ensName, address, name }) =>
            filterIsAddressOrEns ||
            filterWalletData({ ensName, address, name, filter }),
        ),
      );

      const [filteredWallets, filteredWatchedWallets, filteredContactsWallets] =
        [
          filteredWalletsData,
          filteredWatchedWalletsData,
          filteredContactsData,
        ].map((filteredData) => filteredData.map(({ address }) => address));

      setFilteredWallets(filteredWallets);
      setFilteredWatchedWallets(filteredWatchedWallets);
      setFilteredContactsWallets(filteredContactsWallets);
    };
    filterWallets();
  }, [contactsData, filter, walletsData, watchedWalletsData]);

  console.log('------ visibleOwnedWallets', visibleOwnedWallets);
  return {
    wallets: filteredWallets,
    watchedWallets: filteredWatchedWallets,
    contacts: filteredContactsWallets,
  };
};
