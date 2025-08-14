import { removeAccount } from '~/core/keychain';

import { walletOs } from '../os';

export const removeHandler = walletOs.remove.handler(
  async ({ input: address }) => {
    await removeAccount(address);
    return true;
  },
);
