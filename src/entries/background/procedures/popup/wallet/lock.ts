import { lockVault } from '~/core/keychain';
import { SessionStorage } from '~/core/storage';

import { walletOs } from '../os';

export const lockHandler = walletOs.lock.handler(async () => {
  await lockVault();
  await SessionStorage.set('userStatus', 'LOCKED');
});
