import { setVaultPassword } from '~/core/keychain';
import { SessionStorage } from '~/core/storage';

import { popupOs } from '../os';

export const updatePasswordHandler = popupOs.wallet.updatePassword.handler(
  async ({ input: { password, newPassword } }) => {
    await setVaultPassword(password, newPassword);
    await SessionStorage.set('userStatus', 'READY');
  },
);
