import { wipeVault } from '~/core/keychain';

import { walletOs } from '../os';

export const wipeHandler = walletOs.wipe.handler(async () => {
  await wipeVault();
  // Status is now computed from keychain state, no need to set it explicitly
});
