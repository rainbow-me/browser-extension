import { verifyPassword } from '~/core/keychain';

import { popupOs } from '../os';

export const verifyPasswordHandler = popupOs.wallet.verifyPassword.handler(
  async ({ input: { password } }) => {
    return verifyPassword(password);
  },
);
