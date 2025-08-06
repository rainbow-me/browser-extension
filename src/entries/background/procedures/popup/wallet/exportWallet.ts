import { exportKeychain } from '~/core/keychain';

import { popupOs } from '../os';

export const exportWalletHandler = popupOs.wallet.exportWallet.handler(
  async ({ input: { address, password } }) => {
    return await exportKeychain(address, password);
  },
);
