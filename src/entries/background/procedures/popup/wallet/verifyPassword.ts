import { verifyPassword } from '~/core/keychain';

import { walletOs } from '../os';

export const verifyPasswordHandler = walletOs.verifyPassword.handler(
  async ({ input: { password } }) => {
    return verifyPassword(password);
  },
);
