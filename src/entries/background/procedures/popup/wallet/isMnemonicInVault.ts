import { isMnemonicInVault } from '~/core/keychain';

import { popupOs } from '../os';

export const isMnemonicInVaultHandler =
  popupOs.wallet.isMnemonicInVault.handler(async ({ input: { secret } }) => {
    return {
      isInVault: await isMnemonicInVault(secret),
    };
  });
