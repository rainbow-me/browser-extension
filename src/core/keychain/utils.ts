import { RainbowError, logger } from '~/logger';

import { ahaHttp } from '../network/aha';

const ACCOUNTS_TO_DESERIALIZE = 10;

export const autoDiscoverAccounts = async ({
  deriveWallet,
}: {
  deriveWallet: (index: number) => { address: string };
}): Promise<{ accountsEnabled: number }> => {
  let totalAccountsEnabled = 0;
  let lastAccountsEnabled = ACCOUNTS_TO_DESERIALIZE;
  while (lastAccountsEnabled === ACCOUNTS_TO_DESERIALIZE) {
    // eslint-disable-next-line no-await-in-loop
    const { accountsEnabled } = await autoDiscoverAccountsFromIndex({
      initialIndex: totalAccountsEnabled,
      deriveWallet,
    });
    lastAccountsEnabled = accountsEnabled;
    totalAccountsEnabled += accountsEnabled;
  }
  return {
    accountsEnabled: totalAccountsEnabled === 0 ? 1 : totalAccountsEnabled,
  };
};

export const autoDiscoverAccountsFromIndex = async ({
  initialIndex,
  deriveWallet,
}: {
  initialIndex: number;
  deriveWallet: (index: number) => { address: string };
}): Promise<{ accountsEnabled: number }> => {
  const addresses = Array.from(
    { length: ACCOUNTS_TO_DESERIALIZE },
    (_, i) => initialIndex + i,
  ).map((i) => deriveWallet(i).address);

  try {
    const { data } = await ahaHttp.get(`/?address=${addresses.join(',')}`);
    const addressesHaveBeenUsed = data as {
      data: { addresses: { [key: string]: boolean } };
    };

    const firstNotUsedAddressIndex = addresses.findIndex(
      (address) =>
        !addressesHaveBeenUsed.data.addresses[address?.toLowerCase()],
    );

    return {
      accountsEnabled:
        firstNotUsedAddressIndex === -1
          ? ACCOUNTS_TO_DESERIALIZE
          : firstNotUsedAddressIndex,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(new RainbowError(`[aha]: Failed to discover wallets`), {
      message: error.message,
    });
    return { accountsEnabled: 1 };
  }
};
