import { isAddress } from '@ethersproject/address';
import { fetchEnsName } from '@wagmi/core';
import { useEffect, useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { contactsStore, useContactsStore } from '~/core/state/contacts';
import { walletNamesStore } from '~/core/state/walletNames';
import { isENSAddressFormat } from '~/core/utils/ethereum';

import { useWallets } from '../useWallets';

interface WalletData {
  ensName?: string;
  address: Address;
  name?: string;
  contactName?: string;
  walletName?: string;
}

const getAddressData = async ({
  address,
}: {
  address: Address;
}): Promise<WalletData> => {
  const { walletNames } = walletNamesStore.getState();
  const ensName = (await fetchEnsName({ address })) as string;
  const { getContact } = contactsStore.getState();
  const contact = getContact({ address });
  return {
    address,
    ensName,
    contactName: contact?.name,
    walletName: walletNames[address],
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
  contactName,
  walletName,
  filter,
}: {
  ensName?: string;
  address: Address;
  contactName?: string;
  walletName?: string;
  filter: string;
}) =>
  ensName?.toLowerCase()?.startsWith(filter?.toLowerCase()) ||
  address?.toLowerCase()?.startsWith(filter?.toLowerCase()) ||
  contactName?.toLowerCase()?.startsWith(filter?.toLowerCase()) ||
  walletName?.toLowerCase()?.startsWith(filter?.toLowerCase());

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
      const walletsDataPromise = getAddressesData({
        addresses: visibleOwnedWallets.map((wallet) => wallet.address),
      });
      const watchedWalletsDataPromise = getAddressesData({
        addresses: watchedWallets.map((wallet) => wallet.address),
      });
      const contactsDataPromise = getAddressesData({ addresses: contacts });

      const [walletsData, watchedWalletsData, contactsData] = await Promise.all(
        [walletsDataPromise, watchedWalletsDataPromise, contactsDataPromise],
      );
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
          ({ ensName, address, contactName, walletName }) =>
            filterIsAddressOrEns ||
            filterWalletData({
              ensName,
              address,
              contactName,
              walletName,
              filter,
            }),
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

  return {
    wallets: !filter
      ? visibleOwnedWallets.map(({ address }) => address)
      : filteredWallets,
    watchedWallets: !filter
      ? watchedWallets.map(({ address }) => address)
      : filteredWatchedWallets,
    contacts: !filter ? contacts : filteredContactsWallets,
  };
};
