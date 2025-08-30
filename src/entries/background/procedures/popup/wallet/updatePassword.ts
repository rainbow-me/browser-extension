import { setVaultPassword } from '~/core/keychain';
import { SessionStorage } from '~/core/storage';

import { walletOs } from '../os';

export const updatePasswordHandler = walletOs.updatePassword.handler(
  async ({ input: { password, newPassword } }) => {
    await setVaultPassword(password, newPassword);
    await SessionStorage.set('userStatus', 'READY');
  },
);
