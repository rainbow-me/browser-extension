import { getPath } from '~/core/keychain';

import { popupOs } from '../os';

export const pathHandler = popupOs.wallet.path.handler(
  async ({ input: address }) => {
    return await getPath(address);
  },
);
