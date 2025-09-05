import { signMessage } from '~/core/keychain';

import { walletOs } from '../os';

export const personalSignHandler = walletOs.personalSign.handler(
  async ({ input: { address, msgData } }) => {
    return await signMessage({ address, msgData });
  },
);
