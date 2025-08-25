import { wipeVault } from '~/core/keychain';
import { SessionStorage } from '~/core/storage';

import { walletOs } from '../os';

export const wipeHandler = walletOs.wipe.handler(async () => {
  await wipeVault();
  await SessionStorage.set('userStatus', 'NEW');
});
