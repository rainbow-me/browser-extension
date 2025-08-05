import { getWallets } from '~/core/keychain';

import { walletOs } from '../os';

export const walletsHandler = walletOs.wallets.handler(async () => {
  return await getWallets();
});
