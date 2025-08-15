import { isMnemonicInVault } from '~/core/keychain';

import { walletOs } from '../os';

export const isMnemonicInVaultHandler = walletOs.isMnemonicInVault.handler(
  async ({ input: { secret } }) => {
    return {
      isInVault: await isMnemonicInVault(secret),
    };
  },
);
