import { call } from '@orpc/server';

import { importHardwareWallet } from '~/core/keychain';
import { SessionStorage } from '~/core/storage';

import { popupOs } from '../os';

import { statusHandler } from './status';

export const importHardwareHandler = popupOs.wallet.importHardware.handler(
  async ({ input, context }) => {
    const address = await importHardwareWallet(input);

    const { passwordSet } = await call(statusHandler, {}, { context });
    if (!passwordSet) {
      // we probably need to set a password
      await SessionStorage.set('userStatus', 'NEEDS_PASSWORD');
    }

    return { address };
  },
);
