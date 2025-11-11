import { lockVault } from '~/core/keychain';

import { walletOs } from '../os';

export const lockHandler = walletOs.lock.handler(async () => {
  await lockVault();
});
