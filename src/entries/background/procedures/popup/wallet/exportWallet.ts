import { exportKeychain } from '~/core/keychain';

import { walletOs } from '../os';

export const exportWalletHandler = walletOs.exportWallet.handler(
  async ({ input: { address, password } }) => {
    return await exportKeychain(address, password);
  },
);
