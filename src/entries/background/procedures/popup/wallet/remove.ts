import { removeAccount } from '~/core/keychain';

import { popupOs } from '../os';

export const removeHandler = popupOs.wallet.remove.handler(
  async ({ input: address }) => {
    await removeAccount(address);
    return true;
  },
);
