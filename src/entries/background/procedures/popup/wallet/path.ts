import { getPath } from '~/core/keychain';

import { walletOs } from '../os';

export const pathHandler = walletOs.path.handler(async ({ input: address }) => {
  return await getPath(address);
});
