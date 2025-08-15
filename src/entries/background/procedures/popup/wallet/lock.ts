import { lockVault } from '~/core/keychain';
import { SessionStorage } from '~/core/storage';

import { popupOs } from '../os';

export const lockHandler = popupOs.wallet.lock.handler(async () => {
  await lockVault();
  await SessionStorage.set('userStatus', 'LOCKED');
});
