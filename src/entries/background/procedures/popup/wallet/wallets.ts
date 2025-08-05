import { getWallets } from '~/core/keychain';

import { popupOs } from '../os';

export const walletsHandler = popupOs.wallet.wallets.handler(async () => {
  return await getWallets();
});
