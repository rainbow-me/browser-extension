import { unlockVault } from '~/core/keychain';
import { SessionStorage } from '~/core/storage';

import { popupOs } from '../os';

export const unlockHandler = popupOs.wallet.unlock.handler(
  async ({ input: { password } }) => {
    const result = await unlockVault(password);
    if (result) {
      await SessionStorage.set('userStatus', 'READY');
    }
    return result;
  },
);
