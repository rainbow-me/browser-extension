import { unlockVault } from '~/core/keychain';
import { useLastActivityStore } from '~/core/state/lastActivity';

import { walletOs } from '../os';

export const unlockHandler = walletOs.unlock.handler(
  async ({ input: { password } }) => {
    const result = await unlockVault(password);
    if (result) {
      // Record activity when unlocking
      useLastActivityStore.getState().recordActivity();
    }
    // Status is now computed from keychain state, no need to set it explicitly
    return result;
  },
);
