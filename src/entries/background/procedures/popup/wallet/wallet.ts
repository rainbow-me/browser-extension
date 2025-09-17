import * as Sentry from '@sentry/react';

import { getWallet } from '~/core/keychain';
import { INTERNAL_BUILD, IS_TESTING } from '~/core/sentry';

import { walletOs } from '../os';

export const walletHandler = walletOs.wallet.handler(
  async ({ input: address }) => {
    if (INTERNAL_BUILD || IS_TESTING) {
      Sentry.addBreadcrumb({
        message: `Wallet address: ${address}`,
        data: {
          address,
          timestamp: new Date().toISOString(),
        },
      });
    }
    return await getWallet(address);
  },
);
