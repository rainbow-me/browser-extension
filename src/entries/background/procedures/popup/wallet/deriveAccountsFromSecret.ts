import { deriveAccountsFromSecret } from '~/core/keychain';

import { popupOs } from '../os';

export const deriveAccountsFromSecretHandler =
  popupOs.wallet.deriveAccountsFromSecret.handler(
    async ({ input: { secret } }) => {
      return {
        accounts: await deriveAccountsFromSecret(secret),
      };
    },
  );
