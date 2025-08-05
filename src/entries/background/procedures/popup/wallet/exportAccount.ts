import { exportAccount } from '~/core/keychain';

import { popupOs } from '../os';

export const exportAccountHandler = popupOs.wallet.exportAccount.handler(
  async ({ input: { address, password } }) => {
    return await exportAccount(address, password);
  },
);
