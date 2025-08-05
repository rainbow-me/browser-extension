import { signMessage } from '~/core/keychain';

import { popupOs } from '../os';

export const personalSignHandler = popupOs.wallet.personalSign.handler(
  async ({ input: { address, msgData } }) => {
    return await signMessage({ address, msgData });
  },
);
