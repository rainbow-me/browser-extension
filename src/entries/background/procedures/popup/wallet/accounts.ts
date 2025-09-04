import { getAccounts } from '~/core/keychain';

import { walletOs } from '../os';

export const accountsHandler = walletOs.accounts.handler(async () => {
  return await getAccounts();
});
