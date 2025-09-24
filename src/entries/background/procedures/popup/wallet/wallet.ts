import * as Sentry from '@sentry/react';

import { getWallet } from '~/core/keychain';
import { INTERNAL_BUILD, IS_TESTING } from '~/core/sentry';

import { walletOs } from '../os';

export const walletHandler = walletOs.wallet.handler(
  async ({ input: address, errors }) => {
    if (INTERNAL_BUILD || IS_TESTING) {
      Sentry.addBreadcrumb({
        message: `Wallet address: ${address.replace('0x', 'x0000')}`,
        data: {
          address,
          timestamp: new Date().toISOString(),
        },
      });
    }
    try {
      return await getWallet(address);
    } catch (e) {
      if (e instanceof Error) {
        switch (e.message) {
          case 'Keychain manager not initialized':
            throw errors.KEYCHAIN_NOT_INITIALIZED({
              message: e.message,
              cause: e,
            });
          case 'Keychain locked for account':
            throw errors.KEYCHAIN_LOCKED({ message: e.message, cause: e });
          case 'No keychain found for account':
            throw errors.KEYCHAIN_NOT_FOUND({ message: e.message, cause: e });
        }
      }
      throw e;
    }
  },
);
