import { call } from '@orpc/server';

import { importWallet } from '~/core/keychain';
import { SessionStorage } from '~/core/storage';
import { DuplicateAccountError } from '~/core/types/keychainTypes';

import { walletOs } from '../os';

import { statusHandler } from './status';

export const importHandler = walletOs.import.handler(
  async ({ input: { seed }, context, errors }) => {
    try {
      const address = await importWallet(seed);

      // Determine new user status based on password presence
      const { passwordSet } = await call(statusHandler, {}, { context });
      const newStatus = passwordSet ? 'READY' : 'NEEDS_PASSWORD';

      await SessionStorage.set('userStatus', newStatus);
      return { address };
    } catch (e) {
      if (e instanceof DuplicateAccountError) {
        throw errors.DUPLICATE_ACCOUNT({
          message: `Duplicate account ${e.account}`,
          data: {
            address: e.account,
          },
        });
      }
      throw e;
    }
  },
);
