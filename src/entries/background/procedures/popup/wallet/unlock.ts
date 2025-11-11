import { unlockVault } from '~/core/keychain';

import { walletOs } from '../os';

export const unlockHandler = walletOs.unlock.handler(
  async ({ input: { password } }) => {
    const result = await unlockVault(password);
    return result;
  },
);
