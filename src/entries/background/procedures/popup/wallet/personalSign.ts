import { signMessage } from '~/core/keychain';

import { walletOs } from '../os';

export const personalSignHandler = walletOs.personalSign.handler(
  async ({ input: { address, message } }) => {
    return await signMessage({ address, message });
  },
);
