import { call } from '@orpc/server';

import { createWallet } from '~/core/keychain';
import { SessionStorage } from '~/core/storage';

import { popupOs } from '../os';

import { statusHandler } from './status';

export const createHandler = popupOs.wallet.create.handler(
  async ({ context }) => {
    const address = await createWallet();

    const { passwordSet } = await call(statusHandler, {}, { context });

    // we probably need to set a password
    // unless we have a password, then we're ready to go
    const newStatus = passwordSet ? 'READY' : 'NEEDS_PASSWORD';

    await SessionStorage.set('userStatus', newStatus);
    return { address };
  },
);
