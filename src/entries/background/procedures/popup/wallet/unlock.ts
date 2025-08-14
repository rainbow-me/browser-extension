import { unlockVault } from '~/core/keychain';
import { SessionStorage } from '~/core/storage';

import { walletOs } from '../os';

export const unlockHandler = walletOs.unlock.handler(
  async ({ input: { password } }) => {
    const result = await unlockVault(password);
    if (result) {
      await SessionStorage.set('userStatus', 'READY');
    }
    return result;
  },
);
