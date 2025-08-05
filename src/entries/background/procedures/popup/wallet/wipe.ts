import { wipeVault } from '~/core/keychain';
import { SessionStorage } from '~/core/storage';

import { popupOs } from '../os';

export const wipeHandler = popupOs.wallet.wipe.handler(async () => {
  await wipeVault();
  await SessionStorage.set('userStatus', 'NEW');
});
