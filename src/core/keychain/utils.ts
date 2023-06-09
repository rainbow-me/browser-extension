import { ahaHttp } from '../network/aha';

const AACOUNTS_TO_DESERIALIZE = 10;

export const autoDiscoverAccounts = async ({
  deriveWallet,
}: {
  deriveWallet: (index: number) => { address: string };
}): Promise<{ accountsEnabled: number }> => {
  let lastAccountsEnabled = 0;
  while (lastAccountsEnabled % 10 === 0) {
    // eslint-disable-next-line no-await-in-loop
    const { accountsEnabled } = await autoDiscoverAccountsFromIndex({
      initialIndex: lastAccountsEnabled,
      deriveWallet,
    });
    lastAccountsEnabled += accountsEnabled;
  }

  return {
    accountsEnabled: lastAccountsEnabled,
  };
};

const autoDiscoverAccountsFromIndex = async ({
  initialIndex,
  deriveWallet,
}: {
  initialIndex: number;
  deriveWallet: (index: number) => { address: string };
}): Promise<{ accountsEnabled: number }> => {
  const addresses = Array.from(
    { length: AACOUNTS_TO_DESERIALIZE },
    (_, i) => initialIndex + i,
  ).map((i) => deriveWallet(i).address);

  const { data } = await ahaHttp.get(`/?address=${addresses.join(',')}`);
  const addressesHaveBeenUsed = data as {
    data: { addresses: { [key: string]: boolean } };
  };

  const firstNotUsedAddressIndex = addresses.reduce((prev, address, index) => {
    return !addressesHaveBeenUsed.data.addresses[address?.toLowerCase()] &&
      prev === -1
      ? index
      : prev;
  }, -1);

  return {
    accountsEnabled:
      firstNotUsedAddressIndex === -1
        ? AACOUNTS_TO_DESERIALIZE
        : firstNotUsedAddressIndex,
  };
};
