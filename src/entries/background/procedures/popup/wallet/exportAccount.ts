import { exportAccount } from '~/core/keychain';

import { walletOs } from '../os';

export const exportAccountHandler = walletOs.exportAccount.handler(
  async ({ input: { address, password } }) => {
    return await exportAccount(address, password);
  },
);
