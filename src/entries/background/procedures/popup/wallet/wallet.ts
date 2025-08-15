import { getWallet } from '~/core/keychain';

import { walletOs } from '../os';

export const walletHandler = walletOs.wallet.handler(
  async ({ input: address }) => {
    return await getWallet(address);
  },
);
