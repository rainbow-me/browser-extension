import { deriveAccountsFromSecret } from '~/core/keychain';

import { walletOs } from '../os';

export const deriveAccountsFromSecretHandler =
  walletOs.deriveAccountsFromSecret.handler(async ({ input: { secret } }) => {
    return {
      accounts: await deriveAccountsFromSecret(secret),
    };
  });
