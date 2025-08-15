import { getAccounts } from '~/core/keychain';

import { popupOs } from '../os';

export const accountsHandler = popupOs.wallet.accounts.handler(async () => {
  return await getAccounts();
});
