import { setVaultPassword } from '~/core/keychain';

import { walletOs } from '../os';

export const updatePasswordHandler = walletOs.updatePassword.handler(
  async ({ input: { password, newPassword } }) => {
    await setVaultPassword(password, newPassword);
    // Status is now computed from keychain state, no need to set it explicitly
  },
);
