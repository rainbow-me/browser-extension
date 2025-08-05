import { getWallet } from '~/core/keychain';

import { popupOs } from '../os';

export const walletHandler = popupOs.wallet.wallet.handler(
  async ({ input: address }) => {
    return await getWallet(address);
  },
);
