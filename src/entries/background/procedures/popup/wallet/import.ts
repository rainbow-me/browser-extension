import { call } from '@orpc/server';

import { importWallet } from '~/core/keychain';
import { SessionStorage } from '~/core/storage';

import { popupOs } from '../os';

import { statusHandler } from './status';

export const importHandler = popupOs.wallet.import.handler(
  async ({ input: { seed }, context }) => {
    const address = await importWallet(seed);

    // Determine new user status based on password presence
    const { passwordSet } = await call(statusHandler, {}, { context });
    const newStatus = passwordSet ? 'READY' : 'NEEDS_PASSWORD';

    await SessionStorage.set('userStatus', newStatus);
    return { address };
  },
);
